import React from 'react';
import { motion } from 'motion/react';
import { ChatMessage } from '../../types';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
  onActionClick?: (action: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onActionClick }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-6`}
    >
      <div className={`max-w-[85%] sm:max-w-[75%] ${isAssistant ? 'w-full' : ''}`}>
        <div
          className={`px-5 py-4 rounded-3xl shadow-sm ${
            isAssistant
              ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              : 'bg-brand-medium text-white rounded-tr-none shadow-brand-medium/20'
          }`}
        >
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Uploaded plant"
              className="w-full h-48 object-cover rounded-2xl mb-3"
            />
          )}

          {message.content && <p className="leading-relaxed">{message.content}</p>}

          {isAssistant && message.data && (
            <div className="mt-4 space-y-4">
              <div className="p-3 bg-brand-light rounded-2xl border border-brand-accent/30">
                <p className="text-sm font-medium text-brand-dark">{message.data.summary}</p>
              </div>

              {message.data.possible_causes.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <AlertCircle className="w-3 h-3" /> Возможные причины
                  </h4>
                  <ul className="space-y-1">
                    {message.data.possible_causes.map((cause, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 bg-brand-medium rounded-full shrink-0" />
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {message.data.recommendations.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <CheckCircle2 className="w-3 h-3 text-brand-medium" /> Рекомендации
                  </h4>
                  <ul className="space-y-1">
                    {message.data.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 bg-brand-medium rounded-full shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-gray-50">
                <p className="text-[10px] text-gray-400 italic">
                  {message.data.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>

        {isAssistant && message.data?.suggested_actions && message.data.suggested_actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.data.suggested_actions.map((action, i) => (
              <button
                key={i}
                onClick={() => onActionClick?.(action)}
                className="text-xs bg-white/60 hover:bg-white border border-brand-accent/20 px-4 py-2 rounded-full text-brand-dark transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
