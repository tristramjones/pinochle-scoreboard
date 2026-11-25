import React from 'react';
import {TableScrollView} from './TableScrollView';
import {Platform, ScrollViewProps} from 'react-native';

export function KeyboardScrollView({children, ...props}: ScrollViewProps) {
  return (
    <TableScrollView
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </TableScrollView>
  );
}
