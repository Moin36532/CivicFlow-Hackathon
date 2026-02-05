import streamlit as st
import requests

API_URL = "http://127.0.0.1:8000"

st.set_page_config(page_title="CivicFlow", page_icon="🇵🇰", layout="centered")
st.title("CivicFlow: Community Connect")

tab1, tab2 = st.tabs(["📢 Report Issue", "🙋‍♂️ Volunteer Feed"])

# --- TAB 1: REPORTING ---
with tab1:
    st.header("Report a Problem")
    desc = st.text_area("What is happening?", height=100)
    uploaded_file = st.file_uploader("Attach Image (Optional)", type=['png', 'jpg'])
    
    if st.button("Submit Report", type="primary"):
        with st.spinner("AI is analyzing..."):
            files = {"file": (uploaded_file.name, uploaded_file, uploaded_file.type)} if uploaded_file else None
            data = {"description": desc}
            
            try:
                res = requests.post(f"{API_URL}/report", data=data, files=files)
                if res.status_code == 200:
                    data = res.json()
                    st.success("Report Saved!")
                    st.info(f"Classified as: **{data['analysis']['category']}**")
                else:
                    st.error("Server Error")
            except Exception as e:
                st.error(f"Connection Failed: {e}")

# --- TAB 2: VOLUNTEER FEED ---
with tab2:
    st.header("My Recommended Tasks")
    
    c1, c2 = st.columns(2)
    my_skills = c1.text_input("My Skills", "Medical, Rescue")
    
    if st.button("Refresh My Feed"):
        payload = {"user_skills": my_skills, "user_lat": 29.3950, "user_lon": 71.6830}
        
        try:
            res = requests.post(f"{API_URL}/my_feed", data=payload)
            if res.status_code == 200:
                feed = res.json().get("feed", [])
                
                for item in feed:
                    is_govt = item['category'] == 'GOVT'
                    color = "red" if is_govt else "green"
                    icon = "🏛️" if is_govt else "🤝"
                    
                    with st.container(border=True):
                        st.markdown(f"### {icon} :{color}[{item['title']}]")
                        st.caption(f"📍 {item.get('dist_km', 1)} km away • Severity: {item['severity']}/10")
                        st.info(f"💡 {item['reason']}")
                        st.write(item['description'])
                        
                        # ACTION BUTTONS
                        if is_govt:
                            if st.button("✍️ Join Campaign (Legal Notice)", key=f"join_{item['id']}"):
                                with st.spinner("Drafting Legal Notice..."):
                                    pdf_res = requests.post(f"{API_URL}/generate_legal_notice", data={"issue_id": item['id']})
                                    if pdf_res.status_code == 200:
                                        pdf_data = pdf_res.json()
                                        st.success("Legal Notice Generated!")
                                        st.markdown(f"[📥 **Download PDF**]({API_URL}/download_pdf/{pdf_data['filename']})")
                                        with st.expander("Preview Text"):
                                            st.write(pdf_data['preview_text'])
                        else:
                            if st.button("🙋‍♂️ I'll Volunteer", key=f"help_{item['id']}", type="primary"):
                                st.balloons()
                                st.success("Thank you! Coordination details sent.")
            else:
                st.warning("No issues found.")
        except Exception as e:
            st.error(f"Feed Error: {e}")