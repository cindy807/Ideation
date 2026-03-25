/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Users, Package, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MEMBERS_DATA } from './membersData';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('hoodie_checked_ids');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('hoodie_checked_ids', JSON.stringify(Array.from(checkedIds)));
  }, [checkedIds]);

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedIds);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIds(newChecked);
  };

  const filteredMembers = useMemo(() => {
    return MEMBERS_DATA.filter(member => 
      member.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const stats = useMemo(() => {
    const total = MEMBERS_DATA.length;
    const checked = checkedIds.size;
    const bySize: Record<string, number> = {};
    MEMBERS_DATA.forEach(m => {
      bySize[m.size] = (bySize[m.size] || 0) + 1;
    });
    return { total, checked, bySize };
  }, [checkedIds]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                후드집업 배부 체크
              </h1>
              <p className="text-sm text-gray-500 mt-1">멤버별 희망 사이즈 확인 및 수령 체크</p>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">전체 인원</p>
                <p className="text-lg font-mono font-bold text-gray-700">{stats.total}</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">수령 완료</p>
                <p className="text-lg font-mono font-bold text-blue-600">{stats.checked}</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">남은 인원</p>
                <p className="text-lg font-mono font-bold text-orange-500">{stats.total - stats.checked}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="이름(닉네임) 또는 이메일 검색..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Size Summary Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Object.entries(stats.bySize).sort().map(([size, count]) => (
            <div key={size} className="bg-white border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
              <span className="text-xs font-bold text-gray-400">{size}</span>
              <span className="text-sm font-bold text-gray-700">{count}</span>
            </div>
          ))}
        </div>

        {/* Member List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_60px] px-6 py-3 bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <span>멤버 정보</span>
            <span className="text-center">사이즈</span>
            <span className="text-center">체크</span>
          </div>

          <div className="divide-y divide-gray-100">
            <AnimatePresence mode="popLayout">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={member.id}
                    className={`grid grid-cols-[1fr_80px_60px] items-center px-6 py-4 transition-colors hover:bg-gray-50 cursor-pointer ${checkedIds.has(member.id) ? 'bg-blue-50/30' : ''}`}
                    onClick={() => toggleCheck(member.id)}
                  >
                    <div className="flex flex-col">
                      <span className={`font-bold text-gray-900 ${checkedIds.has(member.id) ? 'line-through text-gray-400' : ''}`}>
                        {member.nickname}
                      </span>
                      <span className="text-xs text-gray-400 truncate max-w-[200px] md:max-w-none">
                        {member.email || '정보 없음'}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-mono font-bold ${
                        member.size === '3XL' ? 'bg-purple-100 text-purple-700' :
                        member.size === '2XL' ? 'bg-blue-100 text-blue-700' :
                        member.size === 'XL' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {member.size}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      {checkedIds.has(member.id) ? (
                        <CheckSquare className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Square className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400">검색 결과가 없습니다.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>© 2026 Supercent Hoodie Distribution System</p>
          <p className="mt-1">데이터는 브라우저 로컬 스토리지에 저장됩니다.</p>
        </div>
      </main>
    </div>
  );
}
