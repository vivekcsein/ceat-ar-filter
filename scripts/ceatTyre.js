const Scene = require('Scene');
const d = require('Diagnostics');
const MS = require('Materials');
const TS = require('Textures');
const Time = require('Time');
const TG = require('TouchGestures');
const Animation = require('Animation');
const INS = require('Instruction');
const Reactive = require("Reactive");
const CameraInfo = require("CameraInfo");

let tapON = false;
let touchON = false;
let viewARON = false;

export const Diagnostics = require('Diagnostics');
(async function () {

  const canvas = await Scene.root.findFirst("canvas");
  const viewARBtn = await Scene.root.findFirst("viewinAR_btn");
  const arView = await Scene.root.findFirst("arView");


  const tyreMat = await MS.findFirst("tyreMat");
  const popUp = await Scene.root.findFirst("popUp");
  const popupMat = await MS.findFirst("popupMat");
  const cancelBtn = await Scene.root.findFirst("cancelBtn");

  const TouchPoints = [
    await Scene.root.findFirst("touchPoint3"),
    await Scene.root.findFirst("touchPoint4"),
  ]
  const icons = [
    await Scene.root.findFirst("icon3"),
    await Scene.root.findFirst("icon4"),
  ]
  const iconsText = [
    await Scene.root.findFirst("icontext3"),
    await Scene.root.findFirst("icontext4"),
  ]

  const iconMat = [
    await MS.findFirst('iconMat3'),
    await MS.findFirst('iconMat4'),
  ];
  const iconTextMat = [
    await MS.findFirst('icontextMat3'),
    await MS.findFirst('icontextMat4'),
  ];
  const icon_selected_texture =
    [
      await TS.findFirst('icon3_selected'),
      await TS.findFirst('icon4_selected'),
    ];

  const icon_unselected_texture =
    [
      await TS.findFirst('icon3_unselected'),
      await TS.findFirst('icon4_unselected'),
    ];

  const icontext_selected_texture =
    [
      await TS.findFirst('icontext3_selected'),
      await TS.findFirst('icontext4_selected'),
    ];

  const icontext_unselected_texture =
    [
      await TS.findFirst('icontext3_unselected'),
      await TS.findFirst('icontext4_unselected'),
    ];
  const popup_texture =
    [
      await TS.findFirst('icon3_popup'),
      await TS.findFirst('icon4_popup'),
    ];
  const tyre_with_hotspot =
    [
      await TS.findFirst('tyre_with_hotspot 0'),
      await TS.findFirst('tyre_with_hotspot 1'),
      await TS.findFirst('tyre_with_hotspot 2'),
    ];

  const driver = Animation.timeDriver({ durationMilliseconds: 300, loopCount: 1, mirror: false });
  const samplerLinear = Animation.samplers.linear(0, 1);

  popUp.transform.scaleX = Animation.animate(driver, samplerLinear);
  popUp.transform.scaleY = Animation.animate(driver, samplerLinear);

  const funStart = () => {
    tyreMat.diffuse = tyre_with_hotspot[0];
    TouchPoints.map((touchpoint) => {
      touchpoint.hidden = true;
    })
    popUp.hidden = true;
    cancelBtn.hidden = true;
    tapON = true;
    viewARON = true;
  }

  funStart();

  icons.map((icon, ind) => {
    TG.onTap(icon).subscribe(function (gesture) {
      if (tapON) {
        touchON = true;
        INS.bind(false, 'choose_an_option');
        tyreMat.diffuse = tyre_with_hotspot[ind + 1];
        showSelectedIcon(ind);
      }
    });
  })

  TG.onTap(cancelBtn).subscribe(function (gesture) {
    cancelBtn.hidden = true;
    driver.reverse();

    Time.setTimeout(() => {
      popUp.hidden = true;
      tapON = true;
    }, 300);

  });

  TouchPoints.map((touchPoint, ind) => {
    TG.onTap(touchPoint).subscribe(function (gesture) {
      if (touchON) {
        tapON = false;
        d.log(ind);
        popupMat.diffuse = popup_texture[ind];
        popUp.hidden = false;
        cancelBtn.hidden = false;
        driver.reset();
        driver.start();
      }
    });
  })


  const showSelectedIcon = (iconNum) => {
    for (let i = 0; i < icons.length; i++) {
      if (i == iconNum) {
        iconMat[i].diffuse = icon_selected_texture[i];
        iconTextMat[i].diffuse = icontext_selected_texture[i];
        iconsText[i].transform.y = iconsText[i].transform.y.pinLastValue() - 12
        TouchPoints[i].hidden = false;
      } else {
        iconMat[i].diffuse = icon_unselected_texture[i];
        iconTextMat[i].diffuse = icontext_unselected_texture[i];
        iconsText[i].transform.y = 0;
        TouchPoints[i].hidden = true;
      };
    }
  }



  TG.onTap(viewARBtn).subscribe(function (gesture) {
    if (tapON && viewARON) {
      cameraback();
      viewARON = false;
      arView.hidden = false;
      canvas.hidden = true;
      INS.bind(true, 'flip_camera');
    }

  })

  var planeTracker = await Scene.root.findFirst('planeTracker0');

  TG.onPan().subscribe(function (gesture) {
    planeTracker.trackPoint(gesture.location, gesture.state);
  });

  // onPinch
  let lastScaleX1, lastScaleY1, lastScaleZ1, evalue;
  let zoomUpON = true;
  let zoomDownON = true;
  TG.onPinch().subscribe(function (gesture) {

    lastScaleX1 = arView.transform.scaleX.pinLastValue();
    lastScaleY1 = arView.transform.scaleY.pinLastValue();
    lastScaleZ1 = arView.transform.scaleZ.pinLastValue();

    gesture.scale.monitor().subscribe(function (e) {
      evalue = e.newValue;
      if ((zoomUpON && evalue > 1) || (zoomDownON && evalue < 1)) {

        arView.transform.scaleX = Reactive.mul(lastScaleX1, gesture.scale);
        arView.transform.scaleY = Reactive.mul(lastScaleY1, gesture.scale);
        arView.transform.scaleZ = Reactive.mul(lastScaleZ1, gesture.scale);
      };
    });
  });
  TG.onRotate().subscribe(function (gesture) {
    let lastRotationY1 = arView.transform.rotationZ.pinLastValue();
    arView.transform.rotationZ = Reactive.add(lastRotationY1, Reactive.mul(-1, gesture.rotation));
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
      if (!isBackCam) {
        tapON = true;
        INS.bind(true, 'choose_an_option');
        Time.setTimeout(() => {
          INS.bind(false, 'choose_an_option');
        }, 4000)
        Time.clearInterval(cameraflip);
      } else {
        tapON = false;
        INS.bind(true, 'flip_camera');
      }
    }, 100);
  }

  function cameraback() {
    let cameraflip = Time.setInterval(() => {
      let isBackCam = CameraInfo.captureDevicePosition.eq("BACK").pinLastValue();
      if (isBackCam) {
        INS.bind(false, 'flip_camera');
        Time.clearInterval(cameraflip);
      } else {
        INS.bind(true, 'flip_camera');
      }
    }, 100);
  }

})();
