import { Platform } from "react-native";

const GOOGLE_ROUTES_URL =
  'https://routes.googleapis.com/directions/v2:computeRoutes';

export async function getRoute({
  pickup,
  stops = [],
  destination,
}: {
  pickup: { latitude: number; longitude: number };
  stops?: { latitude: number; longitude: number }[];
  destination: { latitude: number; longitude: number };
}) {
  const response = await fetch(GOOGLE_ROUTES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': Platform.OS == "ios"? process.env.EXPO_PUBLIC_GOOGLE_ROUTES_IOS_API_KEY : process.env.EXPO_PUBLIC_GOOGLE_ROUTES_ANDROID_API_KEY,
      'X-Ios-Bundle-Identifier': 'com.samabidoye.Nano',
      'X-Goog-FieldMask':
        'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
    },
    body: JSON.stringify({
      origin: {
        location: {
          latLng: {
            latitude: pickup.latitude,
            longitude: pickup.longitude,
          },
        },
      },

      intermediates: stops.map((stop) => ({
        location: {
          latLng: {
            latitude: stop.latitude,
            longitude: stop.longitude,
          },
        },
      })),

      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        },
      },

      travelMode: 'DRIVE',
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  return data.routes[0];
}