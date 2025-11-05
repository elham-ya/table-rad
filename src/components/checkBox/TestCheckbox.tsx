import React from 'react';
import Checkbox from './index'; // یا مسیر درست

export default function Test() {
  return (
    <div style={{ padding: 50 }}>
      <Checkbox
        checked={false}
        onChange={(c) => console.log('Changed:', c)}
      />
      <Checkbox checked={true} />
      <Checkbox indeterminate={true} />
    </div>
  );
}