const Scene = require('Scene');
const d = require('Diagnostics');
const MS = require('Materials');
const TS = require('Textures');
const Time = require('Time');
const TG = require('TouchGestures');
const Animation = require('Animation');
const INS = require('Instruction');
const CameraInfo = require("CameraInfo");

let tapON = false;
let touchON = false;
let viewARON = false;
let backCameraON = false;
let screenViewArON = false;
let RotationON = false;


(async function () {

  const canvas = await Scene.root.findFirst("canvas");
  const viewARBtn = await Scene.root.findFirst("viewinAR_btn");
  const arView = await Scene.root.findFirst("arView");
  const arViewBtn = await Scene.root.findFirst("arViewBtn");


  const tyreMat = await MS.findFirst("tyreMat");
  const popUp = await Scene.root.findFirst("popUp");
  const popupMat = await MS.findFirst("popupMat");
  const cancelBtn = await Scene.root.findFirst("cancelBtn");

  const icons = [
    await Scene.root.findFirst("icon1"),
    await Scene.root.findFirst("icon2"),
    await Scene.root.findFirst("icon3"),
    await Scene.root.findFirst("icon4"),
    await Scene.root.findFirst("icon5"),
    await Scene.root.findFirst("icon6"),
  ]

  const iconMat = [
    await MS.findFirst('iconMat1'),
    await MS.findFirst('iconMat2'),
    await MS.findFirst('iconMat3'),
    await MS.findFirst('iconMat4'),
    await MS.findFirst('iconMat5'),
    await MS.findFirst('iconMat6'),
  ];
  const icon_selected_texture =
    [
      await TS.findFirst('icon1_selected'),
      await TS.findFirst('icon2_selected'),
      await TS.findFirst('icon3_selected'),
      await TS.findFirst('icon4_selected'),
      await TS.findFirst('icon5_selected'),
      await TS.findFirst('icon6_selected'),
    ];

  const popup_texture =
    [
      await TS.findFirst('icon1_popup'),
      await TS.findFirst('icon2_popup'),
      await TS.findFirst('icon3_popup'),
      await TS.findFirst('icon4_popup'),
      await TS.findFirst('icon5_popup'),
      await TS.findFirst('icon6_popup'),
    ];

  const driver = Animation.timeDriver({ durationMilliseconds: 300, loopCount: 1, mirror: false });
  const samplerLinear = Animation.samplers.linear(0, 1);

  const driverRotate = Animation.timeDriver({ durationMilliseconds: 2000, loopCount: 1, mirror: false });
  const samplerRotate = Animation.samplers.linear(0, 2 * Math.PI);
  arView.transform.rotationY = Animation.animate(driverRotate, samplerRotate);

  TG.onTap(arViewBtn).subscribe(function (gesture) {
    if (RotationON) {
      RotationON = false;
      driverRotate.reset()
      driverRotate.start()
      Time.setTimeout(() => {
        RotationON = true;
      }, 2000)
    }
  });

  popUp.transform.scaleX = Animation.animate(driver, samplerLinear);
  popUp.transform.scaleY = Animation.animate(driver, samplerLinear);

  const planeTracker = await Scene.root.findFirst('planeTracker0');
  const instPlace = await Scene.root.findFirst("instPlace");
  const instPlace2 = await Scene.root.findFirst("instPlace2");

  const funStart = () => {

    icons.map((icon, ind) => {
      iconMat[ind].diffuse = icon_selected_texture[ind]
      icon.hidden = false;
    })
    popUp.hidden = true;
    cancelBtn.hidden = true;
    tapON = true;
    viewARON = true;
    RotationON = true;
    instPlace.hidden = true;
    instPlace2.hidden = true;
    arViewBtn.hidden = true;

  }

  funStart();

  icons.map((icon, ind) => {
    TG.onTap(icon).subscribe(function (gesture) {
      if (tapON) {
        touchON = true;
        INS.bind(false, 'choose_an_option');
        showSelectedIcon(ind);
      }
    });
  })

  TG.onTap(cancelBtn).subscribe(function (gesture) {
    cancelBtn.hidden = true;

    driver.reverse();
    Time.setTimeout(() => {
      for (let i = 0; i < icons.length; i++) {
        icons[i].hidden = false;
      }
      popUp.hidden = true;
      tapON = true;
    }, 300);

  });


  const touchPopUp = (ind) => {
    tapON = false;
    popupMat.diffuse = popup_texture[ind];
    popUp.hidden = false;
    cancelBtn.hidden = false;
    driver.reset();
    driver.start();
  }

  const showSelectedIcon = (iconNum) => {
    for (let i = 0; i < icons.length; i++) {
      icons[i].hidden = true;
      touchPopUp(iconNum);
    }
  }

  TG.onTap(viewARBtn).subscribe(function (gesture) {
    if (tapON && viewARON) {
      viewARON = false;
      screenViewArON = true;
      canvas.hidden = true;
      instPlace.hidden = false;
      backCameraON = true;
      Time.setTimeout(() => {
        instPlace.hidden = true;
        instPlace2.hidden = false;
      }, 2000)
    }

  })

  TG.onTap().subscribe(function (gesture) {
    if (screenViewArON && backCameraON) {
      screenViewArON = false;
      planeTracker.trackPoint(gesture.location, gesture.state);
      arView.hidden = false;
      instPlace.hidden = true;
      instPlace2.hidden = true;
      Time.setTimeout(() => {
        arViewBtn.hidden = false;
      }, 2000);
    }
  });

  CameraInfo.captureDevicePosition.monitor().subscribe(function (e) {
    if (e.newValue == "BACK") {
      INS.bind(false, 'flip_camera');
    } else {
      camerapos();
    }
  });
  camerapos();
  function camerapos() {
    let cameraflip = Time.setInterval(() => {
      let isBackCam = CameraInfo.captureDevicePosition.eq("BACK").pinLastValue();
      if (isBackCam) {
        tapON = true;
        INS.bind(false, 'flip_camera');
        Time.clearInterval(cameraflip);
      } else {
        tapON = false;
        INS.bind(true, 'flip_camera');
      }
    }, 100);
  }


})();
