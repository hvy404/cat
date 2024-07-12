import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const containerStyle = {
  width: '100%',
  minHeight: '200px',
  padding: '10px',
  backgroundColor: '#f0f0f0',
  borderRadius: '5px',
};

export function Container({ id, children }) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} style={containerStyle}>
      {children}
    </div>
  );
}