import React from 'react';
import { motion } from 'motion/react';
import { ChatMessage } from '../../types';
import { AlertCircle, CheckCircle2, Info, Leaf, Activity, GraduationCap } from 'lucide-react';

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

          {message.content && (
            <p className="leading-relaxed text-[15px]">
              {message.content}
            </p>
          )}

          {isAssistant && message.data && (
            <div className="mt-4 space-y-4 pt-4 border-t border-brand-accent/20">
              {(message.data.plant_name || message.data.disease_name) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {message.data.plant_name && (
                    <div className="flex flex-col">
                      <div className="p-3 bg-brand-light rounded-xl border border-brand-accent/20 flex-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-medium mb-1">
                          <Leaf className="w-3 h-3" />
                          Растение
                        </div>

                        <div className="font-semibold text-brand-dark mb-2">
                          {message.data.plant_name}
                        </div>

                        {message.data.plant_url && (
                          <a
                            href={message.data.plant_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-brand-medium hover:underline font-bold uppercase"
                          >
                            Подробнее
                            <Info className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {message.data.disease_name && (
                    <div className="flex flex-col">
                      <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">
                          <Activity className="w-3 h-3" />
                          Состояние
                        </div>

                        <div className="font-semibold text-red-700 mb-2">
                          {message.data.disease_name}
                        </div>

                        {message.data.disease_url && (
                          <a
                            href={message.data.disease_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-red-400 hover:underline font-bold uppercase"
                          >
                            Справочник
                            <Info className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {message.data.possible_causes.length > 0 && (
                <div className="px-1">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    <AlertCircle className="w-3 h-3" />
                    Анализ причин
                  </h4>

                  <ul className="space-y-2">
                    {message.data.possible_causes.map((cause, i) => (
                      <li
                        key={i}
                        className="text-sm flex items-start gap-2 leading-relaxed"
                      >
                        <span className="mt-2 w-1 h-1 bg-brand-medium rounded-full shrink-0" />
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {message.data.recommendations.length > 0 && (
                <div className="p-4 bg-brand-medium/5 rounded-2xl border border-brand-accent/30 shadow-inner">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-dark mb-3">
                    <CheckCircle2 className="w-3 h-3 text-brand-medium" />
                    План действий
                  </h4>

                  <ul className="space-y-2">
                    {message.data.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="text-sm flex items-start gap-3 text-gray-700 leading-relaxed"
                      >
                        <div className="w-5 h-5 rounded-full bg-brand-medium/20 text-brand-medium flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {i + 1}
                        </div>

                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {message.data.detailed_advice && (
                <div className="px-1 pt-2">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <GraduationCap className="w-3 h-3" />
                    Экспертный совет
                  </h4>

                  <p className="text-sm italic text-gray-600 leading-relaxed">
                    {message.data.detailed_advice}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {isAssistant &&
          message.data?.suggested_actions &&
          Array.isArray(message.data.suggested_actions) &&
          message.data.suggested_actions.filter(
            (action) =>
              typeof action === 'string' &&
              action.trim().length > 0
          ).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.data.suggested_actions
                .filter(
                  (action) =>
                    typeof action === 'string' &&
                    action.trim().length > 0
                )
                .map((action, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (
                        typeof action === 'string' &&
                        action.trim().length > 0
                      ) {
                        onActionClick?.(action.trim());
                      }
                    }}
                    className="text-xs bg-white/60 hover:bg-white border border-brand-accent/20 px-4 py-2 rounded-full text-brand-dark transition-all duration-200"
                  >
                    {action}
                  </motion.button>
                ))}
            </div>
          )}
      </div>
    </motion.div>
  );
};