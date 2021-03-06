import React from 'react';
import { View, Image } from 'react-native';
import { createVariant } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const shadow = {
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

export const Header = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      sx={{
        backgroundColor: '$colors.white',
        padding: '$space.3',
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: { '@base': 'center', '@sm': 'space-around' },
      }}
      style={{ paddingTop: insets.top }}
    >
      <View
        sx={{
          borderRadius: 50,
          shadowColor: '#000',
          ...shadow,
        }}
      >
        <Avatar
          source={{
            uri: 'https://cdn.vox-cdn.com/thumbor/zFJuBWv5NjSeVilWJntvQcgji5M=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/19979927/jomi_avatar_nickleodeon_ringer.jpg',
          }}
          sx={{
            height: { '@base': 100, '@sm': 120 },
            width: { '@base': 100, '@sm': 120 },
          }}
        />
      </View>
      <Image
        source={{
          uri: 'https://i.pinimg.com/originals/ce/27/87/ce27870499a90e05363c91afe6b04aed.png',
        }}
        sx={{
          height: { '@base': 100, '@sm': 120 },
          aspectRatio: 1.7,
          marginLeft: 20,
        }}
      />
    </View>
  );
};

const Avatar = createVariant(Image, {
  borderRadius: 50,
  height: 80,
  width: 80,
});
