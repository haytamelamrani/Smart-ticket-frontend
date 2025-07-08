'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type Ticket = {
  id: number;
  title: string;
  description: string;
  userEmail: string;
  etat: string;
  priority: string;
  category: string;
  type: string;
  similarity: number;
};

const SimilarTicketsPage = () => {
  const [ticketGroups, setTicketGroups] = useState<Ticket[][]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupedTickets = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const response = await axios.get('http://localhost:8080/api/tickets/grouped?threshold=0.4', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTicketGroups(response.data);
      } catch (err) {
        console.error(err);
        setError('❌ Impossible de récupérer les groupes de tickets similaires.');
      }
    };

    fetchGroupedTickets();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="p-6">
      {error && (
        <div className="text-red-600 font-semibold mb-4">
          {error}
        </div>
      )}

      <h2 className="text-2xl font-bold text-green-700 mb-6">
        📂 Groupes de tickets similaires
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ticketGroups.map((group, index) => (
          <motion.div
            key={index}
            layout
            onClick={() => toggleExpand(index)}
            className="cursor-pointer"
          >
            <Card className="rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="font-bold text-lg text-green-600 mb-1">
                  <Link href={`/AllTickets?id=${group[0]?.id}`} className="hover:underline">
                    🎫 Ticket principal : {group[0]?.title}
                  </Link>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {group.length - 1} ticket(s) similaire(s)
                </div>

                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 overflow-hidden"
                    >
                      {group.slice(1).map((ticket) => (
                        <div key={ticket.id} className="border-t pt-2 mt-2 text-sm">
                          <Link
                            href={`/AllTickets?id=${ticket.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            🔗 <strong>{ticket.title}</strong>
                          </Link>
                          <br />
                          📝 {ticket.description}
                          <div className="text-xs text-gray-500 mt-1">
                            🎯 Similarité : {(ticket.similarity * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SimilarTicketsPage;
