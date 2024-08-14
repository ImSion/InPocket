import React from 'react';

export default function GroupList({ groups, onSelectGroup }) {
  return (
    <div className="w-1/3 pr-4">
      <h2 className="text-xl font-semibold mb-2">Elenco Gruppi</h2>
      <ul>
        {groups.map(group => (
          <li 
            key={group._id}
            onClick={() => onSelectGroup(group)}
            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
}