import React, { useState } from 'react';
import { Button } from './Button';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useNotifications } from '../lib/notifications-context';

interface Feedback {
  id: string;
  agentId: string;
  chatId: string;
  comment: string;
  createdAt: string;
}

interface FeedbackSectionProps {
  agentId: string;
  chatId: string;
  onSubmit: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => Promise<void>;
  feedbacks: Feedback[];
}

export function FeedbackSection({ agentId, chatId, onSubmit, feedbacks }: FeedbackSectionProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPreviousFeedback, setShowPreviousFeedback] = useState(false);
  const { addNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        agentId,
        chatId,
        comment
      });
      
      // Add notification when feedback is submitted
      addNotification(
        'New Feedback',
        'New feedback has been submitted for your AI agent',
        agentId
      );
      
      setComment('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <MessageSquare className="h-5 w-5" />
          <span>Please Provide Feedback for your AI</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-900 mb-2">
              Please Provide Feedback for your AI
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Share your thoughts about the AI's performance..."
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Feedback
            </Button>
          </div>
        </form>
      )}

      {feedbacks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowPreviousFeedback(!showPreviousFeedback)}
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Previous Feedback ({feedbacks.length})</span>
            {showPreviousFeedback ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
          
          {showPreviousFeedback && (
            <div className="mt-4 space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{feedback.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}