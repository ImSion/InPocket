import React from 'react';

export default function GroupList({ groups, onSelectGroup }) {
  return (
    <div className="w-1/3 pr-4">
      <h2 className="text-xl font-semibold mb-2 dark:text-white">Elenco Gruppi</h2>
      <ul>
        {groups.map(group => (
          <li 
            key={group._id}
            onClick={() => onSelectGroup(group)}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-cyan-600 p-2 rounded dark:text-white"
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
}