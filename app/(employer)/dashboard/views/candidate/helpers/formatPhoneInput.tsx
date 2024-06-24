import React, { useState, useEffect, ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";

interface FormattedPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * A formatted phone input component.
 *
 * @component
 * @example
 * ```tsx
 * <FormattedPhoneInput value={phoneNumber} onChange={handlePhoneChange} />
 * ```
 */
const FormattedPhoneInput: React.FC<FormattedPhoneInputProps> = ({ value, onChange }) => {
  const [formattedValue, setFormattedValue] = useState<string>('');

  useEffect(() => {
    setFormattedValue(formatPhoneNumber(value));
  }, [value]);

  /**
   * Formats the phone number input.
   *
   * @param input - The phone number input.
   * @returns The formatted phone number.
   */
  const formatPhoneNumber = (input: string): string => {
    const cleaned = input.replace(/\D/g, '').slice(0, 10);
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return '(' + match[1] + (match[2] ? ') ' : '') + match[2] + (match[3] ? '-' + match[3] : '');
    }
    return cleaned;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/\D/g, '').slice(0, 10);
    const formatted = formatPhoneNumber(numericValue);
    setFormattedValue(formatted);
    onChange(numericValue);
  };

  return (
    <Input
      type="tel"
      value={formattedValue}
      onChange={handleChange}
      placeholder="(XXX) XXX-XXXX"
    />
  );
};

export default FormattedPhoneInput;