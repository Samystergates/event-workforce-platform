import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { FONT_MAP, LOCAL_IMAGES, REMOTE_IMAGES } from '../config/assetsManifest';

async function cacheImages(images: (number | string)[]) {
  const tasks = images.map((img) => Asset.fromModule(img as any).downloadAsync());
  await Promise.all(tasks);
}

export function useAppResources() {
  const [assetsReady, setAssetsReady] = useState(false);

  // Preload commonly used icon fonts (safe even if not used everywhere)
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...FONT_MAP,
  });

  useEffect(() => {
    (async () => {
      try {
        const builtIns = [
          require('../../assets/images/icon.png'),
          require('../../assets/images/adaptive-icon.png'),
          require('../../assets/images/splash-icon.png'),
        ];
        await cacheImages([...builtIns, ...LOCAL_IMAGES]);

        // Prefetch remote images (no-op if list is empty)
        await Promise.all((REMOTE_IMAGES ?? []).map((uri) => Image.prefetch(uri)));
      } catch {
        // Ignore cache errors; app can still start
      } finally {
        setAssetsReady(true);
      }
    })();
  }, []);

  return fontsLoaded && assetsReady;
}
