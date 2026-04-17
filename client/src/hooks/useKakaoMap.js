import { useEffect, useRef } from 'react'

const APP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

// 모듈 싱글턴 — React strict mode 이중 실행, 다중 훅 호출 모두 방어
let _promise = null

function getKakao() {
  if (_promise) return _promise
  _promise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${APP_KEY}&libraries=services&autoload=false`
    script.onload = () => window.kakao.maps.load(resolve)
    script.onerror = () => {
      _promise = null
      reject(new Error('카카오맵 SDK 로드 실패. API 키와 도메인 등록을 확인하세요.'))
    }
    document.head.appendChild(script)
  })
  return _promise
}

/**
 * 지도 표시용 훅
 */
export function useKakaoMap(lat, lng) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (lat == null || lng == null) return
    getKakao().then(() => {
      if (!containerRef.current) return
      const { maps } = window.kakao
      const center = new maps.LatLng(lat, lng)
      if (!mapRef.current) {
        mapRef.current = new maps.Map(containerRef.current, { center, level: 3 })
        markerRef.current = new maps.Marker({ position: center, map: mapRef.current })
      } else {
        mapRef.current.setCenter(center)
        markerRef.current.setPosition(center)
      }
    }).catch(() => {})
  }, [lat, lng])

  return containerRef
}

/**
 * 주소 → 좌표 변환 훅
 */
export function useKakaoGeocoder() {
  function geocode(address) {
    return getKakao().then(() => new Promise((resolve, reject) => {
      const { services } = window.kakao.maps
      const Status = services.Status

      // 주소 검색 → 결과 없으면 키워드(장소명) 검색으로 폴백
      const geocoder = new services.Geocoder()
      geocoder.addressSearch(address, (addrResult, addrStatus) => {
        if (addrStatus === Status.OK) {
          resolve({
            lat: parseFloat(addrResult[0].y),
            lng: parseFloat(addrResult[0].x),
            roadAddress: addrResult[0].road_address?.address_name ?? '',
            jibunAddress: addrResult[0].address?.address_name ?? '',
          })
          return
        }
        // 주소 검색 실패 → 장소명 검색
        const places = new services.Places()
        places.keywordSearch(address, (placeResult, placeStatus) => {
          if (placeStatus === Status.OK) {
            resolve({
              lat: parseFloat(placeResult[0].y),
              lng: parseFloat(placeResult[0].x),
              roadAddress: placeResult[0].road_address_name ?? '',
              jibunAddress: placeResult[0].address_name ?? '',
            })
          } else {
            reject(new Error('주소 또는 장소를 찾을 수 없습니다.'))
          }
        })
      })
    }))
  }

  return geocode
}
