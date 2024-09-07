import React from 'react';
import { Dropdown } from 'flowbite-react';

export default function GroupList({ groups, onSelectGroup }) {
  return (
    <div className="mb-4">
      <Dropdown label="Elenco Gruppi" className="w-72" arrowIcon={false}>
        {groups.length === 0 ? (
          <Dropdown.Item>Nessun gruppo disponibile</Dropdown.Item>
        ) : (
          groups.map(group => (
            <Dropdown.Item 
              key={group._id}
              onClick={() => onSelectGroup(group)}
              className='fade-in-right'
            >
              {group.name}
            </Dropdown.Item>
          ))
        )}
      </Dropdown>
    </div>
  );
}