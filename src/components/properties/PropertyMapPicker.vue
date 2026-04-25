<template>
  <div class="space-y-4">
    <div
      id="map"
      class="h-80 w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 z-0"
    ></div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Latitud</label>
        <input
          type="number"
          step="0.000001"
          v-model.number="localLat"
          @input="handleManualInput"
          class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder="-90 a 90"
        />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Longitud</label>
        <input
          type="number"
          step="0.000001"
          v-model.number="localLng"
          @input="handleManualInput"
          class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder="-180 a 180"
        />
      </div>
    </div>
    <p class="text-[10px] text-gray-400 italic">
      * Puedes hacer clic en el mapa o ingresar las coordenadas manualmente.
    </p>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  // Fix para iconos
  import markerIcon from 'leaflet/dist/images/marker-icon.png';
  import markerShadow from 'leaflet/dist/images/marker-shadow.png';

  const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  L.Marker.prototype.options.icon = DefaultIcon;

  const props = defineProps<{
    modelValue: { lat: number | null; lng: number | null };
  }>();

  const emit = defineEmits(['update:modelValue']);

  // Estados locales para los inputs
  const localLat = ref<number | null>(props.modelValue.lat);
  const localLng = ref<number | null>(props.modelValue.lng);

  let map: L.Map;
  let marker: L.Marker | null = null;

  onMounted(() => {
    const initialLat = localLat.value || -16.5;
    const initialLng = localLng.value || -68.15;

    map = L.map('map').setView([initialLat, initialLng], localLat.value ? 16 : 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    if (localLat.value && localLng.value) {
      updateMarker(localLat.value, localLng.value, false);
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      localLat.value = e.latlng.lat;
      localLng.value = e.latlng.lng;
      updateMarker(e.latlng.lat, e.latlng.lng, true);
    });
  });

  // Maneja la escritura manual en los inputs
  function handleManualInput() {
    if (localLat.value !== null && localLng.value !== null) {
      // Solo actualizamos el marcador si son números válidos
      if (!isNaN(localLat.value) && !isNaN(localLng.value)) {
        updateMarker(localLat.value, localLng.value, true);
        // Opcional: Centrar el mapa si el usuario escribe
        map.panTo([localLat.value, localLng.value]);
      }
    }
  }

  function updateMarker(lat: number, lng: number, shouldEmit: boolean) {
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker!.getLatLng();
        localLat.value = pos.lat;
        localLng.value = pos.lng;
        emit('update:modelValue', { lat: pos.lat, lng: pos.lng });
      });
    }

    if (shouldEmit) {
      emit('update:modelValue', { lat, lng });
    }
  }

  // Sincronizar si el valor cambia externamente (desde el padre)
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal.lat !== localLat.value || newVal.lng !== localLng.value) {
        localLat.value = newVal.lat;
        localLng.value = newVal.lng;
        if (newVal.lat && newVal.lng) updateMarker(newVal.lat, newVal.lng, false);
      }
    },
    { deep: true }
  );
</script>
