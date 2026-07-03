import { Text, type TextProps } from 'react-native';

import { type } from '@/theme';

function make(style: object) {
  return function Typo({ style: override, ...rest }: TextProps) {
    return <Text {...rest} style={[style, override]} />;
  };
}

export const Display = make(type.display);
export const Title = make(type.title);
export const Heading = make(type.heading);
export const Body = make(type.body);
export const Caption = make(type.caption);
export const Micro = make(type.micro);
