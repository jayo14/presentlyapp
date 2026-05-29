import { View } from 'react-native';

let MapView: any = View;
let Marker: any = View;
let Circle: any = View;

try {
  // Use a dynamic require to avoid static analysis crashes on some platforms
  const Maps = require('react-native-maps');
  MapView = Maps.default || Maps.MapView;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
} catch (error) {
  console.warn('react-native-maps could not be loaded. Falling back to dummy components.', error);
}

export { MapView, Marker, Circle };
