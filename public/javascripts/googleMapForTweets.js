let map
let outPutData = {}
const dataForOutput = document.getElementById('dataForOutput')
const tagPosition = document.querySelector('.googleMapTag')

function handleLocationError(infoWindow, content, position) {
  infoWindow.setPosition(position)
  infoWindow.setContent(content)
  infoWindow.open(map)
}

function initMap() {
  // 建立打開Google Map會看到的初始地點
  const options = {
    center: {
      lat: 25.105497,
      lng: 121.597366
    },
    zoom: 8
  }
  map = new google.maps.Map(document.getElementById('map'), options);

  // 顯示使用者目前所在位置
  let currentPosition = new google.maps.InfoWindow
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (p) {
      const position = {
        lat: p.coords.latitude,
        lng: p.coords.longitude
      }
      currentPosition.setPosition(position)
      currentPosition.setContent('Your location')
      currentPosition.open(map);
    }, function () {
      handleLocationError(currentPosition, 'Geolocation service failed！', map.getCenter())
    })
  } else {
    handleLocationError(currentPosition, 'No geolocation available！', map.getCenter())
  }

  // 建立搜尋功能
  const input = document.getElementById('search')
  const searchBox = new google.maps.places.SearchBox(input)

  // bounds_changed指偵測到可視範圍的變動，這時也會把searchBox的可視範圍設成一樣
  map.addListener('bounds_changed', () => {
    searchBox.setBounds(map.getBounds())
  })

  let markers = []
  let infoWindow = []
  searchBox.addListener('places_changed', () => {
    // places為搜尋資料，有幾筆，就以陣列方式表現
    const places = searchBox.getPlaces()
    // 找不到資料，什麼都不做
    if (places.length === 0) return
    // 清除地圖上所有地標
    markers.forEach(m => m.setMap(null))
    markers = []
    // create bounds object which is the coordinate boundaries of map
    const bounds = new google.maps.LatLngBounds()
    // add marker for each places and adjust the bounds of map

    places.forEach((p, i) => {
      if (!p.geometry) return
      // 根據搜尋到的地圖資料去顯示標籤(marker)
      markers.push(new google.maps.Marker({
        map,
        title: p.name,
        position: p.geometry.location,
        animation: google.maps.Animation.DROP
      }))
      markers[i].setMap(map)
      // update the bounds of our map to take each place into account
      if (p.geometry.viewport) {
        bounds.union(p.geometry.viewport)
      } else {
        bounds.extend(p.geometry.location)
      }
      map.fitBounds(bounds)

      const contentString = `<h3 class="w-100 text-center">${p.name}</h3>` + `<small>click Add Location to add</small>`
      infoWindow.push(new google.maps.InfoWindow)
      infoWindow[i].setContent(contentString)

      // 如果資料只有一個，就直接塞到輸出資料裡面，讓使用者不用點選地點
      // 反之，如果資料不只一個，就給予addListener，讓使用者點選想要的地點
      if (places.length !== 1) {
        markers[i].addListener('click', () => {
          infoWindow[i].open(map, markers[i])
          input.value = p.name
          Object.assign(outPutData, {
            location: p.name,
            latitude: markers[i].position.lat(),
            longitude: markers[i].position.lng()
          })
        })
      } else {
        markers[i].addListener('click', () => {
          infoWindow[i].open(map, markers[i])
        })
        Object.assign(outPutData, {
          location: p.name,
          latitude: markers[i].position.lat(),
          longitude: markers[i].position.lng()
        })
      }
    })
  })
}

const inputBtn = document.getElementById('inputBtn')
const quitBtn = document.getElementById('quitBtn')
inputBtn.addEventListener('click', () => {
  // 清除打卡圖示、暫存的地點資料(給資料庫的資料)
  dataForOutput.innerHTML = ''
  tagPosition.innerHTML = ''
  const dataExist = Object.keys(outPutData)
  if (dataExist.length === 3) {
    console.log('outPutData', outPutData)
    for (data of dataExist) {
      const newItem = document.createElement('input')
      newItem.name = data
      newItem.value = outPutData[data]
      dataForOutput.appendChild(newItem)
    }
    const tagHTML = `
    <div class="tag border border-success rounded mt-2 p-1 h-75 pl-2" style="line-height:1.6">Location: ${outPutData.location}<i
      class="fa fa-trash mx-2" aria-hidden="true"></i>
    </div>
    `
    tagPosition.innerHTML += tagHTML
    removeTag()
    window.alert('Location added！')
    quitBtn.click()
  } else {
    window.alert('Please search and click a location to add！')
  }
})

function removeTag() {
  const trashIcon = document.querySelector('.fa-trash')
  trashIcon.addEventListener('click', () => {
    const tag = event.target.parentElement
    tag.remove()
    outPutData = {}
    dataForOutput.innerHTML = ''
  })

}

const tweetLocations = document.querySelectorAll('#tweetLocation')
tweetLocations.forEach(tweetLocation => {
  tweetLocation.addEventListener('click', () => {
    let tweetMap
    let { lat, lng, location, id } = event.target.dataset
    const locationId = 'map_' + id
    lat = Number(lat)
    lng = Number(lng)
    let site = document.getElementById(`${locationId}`)
    tweetMap = new google.maps.Map(site, {
      center: {
        lat,
        lng
      },
      zoom: 10,
    });
    new google.maps.Marker({
      map: tweetMap,
      title: location,
      position: { lat, lng },
      animation: google.maps.Animation.DROP
    })
  })
})