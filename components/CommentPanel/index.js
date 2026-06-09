"use client";
//Still in progress
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, UserCircle2 } from "lucide-react";

const CommentPanel = ({ isOpen, onClose, videoId }) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData = {
      id: Date.now(),
      user: "Current User",
      text: newComment,
      time: "Just now",
    };
    setComments([commentData, ...comments]);
    setNewComment("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()} 
          className="absolute top-0 right-0 w-full md:w-[360px] h-full bg-black/80 backdrop-blur-2xl border-l border-white/10 z-[60] flex flex-col shadow-2xl"
        >
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10">
            <h3 className="text-white font-semibold text-lg tracking-wide">
              Comments <span className="text-gray-400 text-sm ml-1">({comments.length})</span>
            </h3>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {comments.length === 0 ? (
              // Beautiful Empty State UI for when there are no comments
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-60 mt-10">
                <MessageCircle size={48} className="mb-4 opacity-50" />
                <p className="text-base font-medium text-white">No comments yet</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <UserCircle2 size={36} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{comment.user}</span>
                      <span className="text-gray-400 text-xs">{comment.time}</span>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/10 bg-black/40">
            <form onSubmit={handlePostComment} className="relative flex items-center">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-white/10 text-white text-sm rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-gray-400"
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                className="absolute right-2 p-1.5 rounded-full text-white bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 transition-colors"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentPanel;