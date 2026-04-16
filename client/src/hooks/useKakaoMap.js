import { useEffect, useRef, useState } from 'react'

const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&libraries=services&autoload=false`

function loadKakaoSdk() {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(resolve)
      return
    }
    const existing = document.querySelector('script[src*="dapi.kakao.com"]')
    if (existing) {
      existing.addEventListener('load', () => window.kakao.maps.load(resolve))
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.src = KAKAO_SDK_URL
    script.onload = () => window.kakao.maps.load(resolve)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * 지도 표시용 훅
 * @param {number|null} lat
 * @param {number|null} lng
 */
export function useKakaoMap(lat, lng) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadKakaoSdk().then(() => setReady(true)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!ready || !containerRef.current || lat == null || lng == null) return

    const { maps } = window.kakao
    const center = new maps.LatLng(lat, lng)

    if (!mapRef.current) {
      mapRef.current = new maps.Map(containerRef.current, { center, level: 3 })
      markerRef.current = new maps.Marker({ position: center, map: mapRef.current })
    } else {
      mapRef.current.setCenter(center)
      markerRef.current.setPosition(center)
    }
  }, [ready, lat, lng])

  return containerRef
}

/**
 * 주소 검색 → 좌표 반환
 * @returns {(address: string) => Promise<{lat: number, lng: number, roadAddress: string, jibunAddress: string}>}
 */
export function useKakaoGeocoder() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadKakaoSdk().then(() => setReady(true)).catch(() => {})
  }, [])

  function geocode(address) {
    return new Promise((resolve, reject) => {
      if (!ready || !window.kakao?.maps?.services) {
        reject(new Error('Kakao Maps SDK not ready'))
        return
      }
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          resolve({
            lat: parseFloat(result[0].y),
            lng: parseFloat(result[0].x),
            roadAddress: result[0].road_address?.address_name ?? '',
            jibunAddress: result[0].address?.address_name ?? '',
          })
        } else {
          reject(new Error('주소를 찾을 수 없습니다.'))
        }
      })
    })
  }

  return ready ? geocode : null
}
