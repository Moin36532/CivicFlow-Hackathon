import { useState, useEffect } from 'react';
import { fetchComments, postComment } from '@/services/api';
import { Loader2, Send, MessageCircle } from 'lucide-react';

export function CommentsSection({ issueId }: { issueId: string }) {
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(false);

    // Mock Current User (Ideally this comes from a proper Auth Context)
    const currentUser = {
        name: "Jon Anderson",
        avatar: "https://t4.ftcdn.net/jpg/06/08/55/73/360_F_608557356_ELcD2pwQO9pduTRL30umabzgJoQn5fnd.jpg"
    };

    const loadComments = async () => {
        try {
            const data = await fetchComments(issueId);
            setComments(data);
        } catch (err) {
            console.error("Failed to load comments", err);
        }
    };

    useEffect(() => {
        loadComments();
        // Poll for comments every 10 seconds for real-time feel
        const interval = setInterval(loadComments, 10000);
        return () => clearInterval(interval);
    }, [issueId]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setLoading(true);
        try {
            await postComment(issueId, currentUser.name, commentText, currentUser.avatar);
            setCommentText("");
            await loadComments();
        } catch (err) {
            console.error("Failed to post comment", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <MessageCircle className="w-5 h-5" />
                Community Discussion
            </h3>

            {/* List Comments */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {comments.length > 0 ? (
                    comments.map((c: any) => (
                        <div key={c.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300 dark:border-slate-700">
                                {c.avatar ? <img src={c.avatar} className="w-full h-full object-cover" alt={c.user_name} /> : null}
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg flex-1 border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{c.user_name}</p>
                                    <span className="text-xs text-slate-400">{new Date(c.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{c.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg dashed border border-slate-200 dark:border-slate-700">
                        <p className="text-sm italic">No comments yet. Be the first to start the conversation!</p>
                    </div>
                )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handlePostComment} className="flex gap-3 items-start relative">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300 dark:border-slate-700 mt-1">
                    <img src={currentUser.avatar} className="w-full h-full object-cover" alt="Me" />
                </div>
                <div className="flex-1 relative">
                    <textarea
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        rows={2}
                        className="w-full text-sm px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={!commentText.trim() || loading}
                        className="absolute right-2 bottom-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        title="Post Comment"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
