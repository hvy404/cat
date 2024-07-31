import React, { useState, useEffect, ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";

interface PrefixedUrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PrefixedUrlInput: React.FC<PrefixedUrlInputProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const prefix = 'https://';

  useEffect(() => {
    setInputValue(value.startsWith(prefix) ? value.slice(prefix.length) : value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(prefix + newValue);
  };

  return (
    <div className="flex">
      <div className="bg-gray-100 border border-r-0 rounded-l-md px-3 py-2 text-sm text-gray-500">
        {prefix}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className="rounded-l-none"
        placeholder="www.example.com"
      />
    </div>
  );
};

export default PrefixedUrlInput;