import { memo } from 'react';
import { View } from 'react-native';
import { Check, CheckCheck } from 'lucide-react-native';
import type { MessageDeliveryStatus } from '../types';

interface Props {
  status: MessageDeliveryStatus;
  readColor?: string;
  mutedColor?: string;
}

export const MessageStatusChecks = memo(function MessageStatusChecks({
  status,
  readColor = '#B8E0FF',
  mutedColor = 'rgba(255,255,255,0.65)',
}: Props) {
  if (status === 'sending') {
    return <Check color={mutedColor} size={14} strokeWidth={2.5} />;
  }

  if (status === 'sent') {
    return <Check color={mutedColor} size={14} strokeWidth={2.5} />;
  }

  const checkColor = status === 'read' ? readColor : mutedColor;

  return (
    <View style={{ flexDirection: 'row', marginLeft: -2 }}>
      <CheckCheck color={checkColor} size={14} strokeWidth={2.5} />
    </View>
  );
});
