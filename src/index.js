import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./index.scss";

var imageJson = require("./img/imgData.json");

class ImgFigure extends Component {
  constructor(props) {
    super(props);
    this.figureDOM = null;
    this.state = {
      styleObj: {},
      className: "img-figure"
    };
  }

  componentWillReceiveProps(nextProps) {
    var styleObj = {
      ...nextProps.arrange.pos,
      transform: "rotate(" + nextProps.arrange.rotate + "deg)"
    };
    var className = "img-figure";
    className += nextProps.arrange.isInverse ? " is-inverse " : "";
    this.setState({
      styleObj,
      className: className
    });
  }

  getWidth() {
    return this.figureDOM.scrollWidth;
  }
  getHeight() {
    return this.figureDOM.scrollHeight;
  }

  handleClick(e) {
    if (this.props.arrange.isCenter) {
      this.props.inverse();
    } else {
      this.props.center();
    }
    e.preventDefault();
    e.stopPropagation();
  }
  render() {
    return (
      <figure
        className={this.state.className}
        style={this.state.styleObj}
        onClick={this.handleClick.bind(this)}
        ref={ele => {
          this.figureDOM = ele;
        }}
      >
        <img src={this.props.url} alt={this.props.title} />
        <figcaption>
          <h2 className="img-title">{this.props.title}</h2>
          <div className="img-back" onClick={this.handleClick.bind(this)}>
            <p>{this.props.description}</p>
          </div>
        </figcaption>
      </figure>
    );
  }
}

function getRangeRandom(low, high) {
  return Math.ceil(Math.random() * (high - low) + low);
}

function get30DegRandom() {
  return (Math.random() > 0.5 ? "" : "-") + Math.ceil(Math.random() * 30);
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      imgsArrangeArr: [
        // {
        //   pos: {
        //     left: 0,
        //     top: 0
        //   },
        // rotate: 0,
        // isInverse: false,
        // isCenter: false
        // }
      ]
    };
    imageJson.forEach((val, index) => {
      if (!this.state.imgsArrangeArr[index]) {
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        };
      }
    });
    this.stageDOM = null;
    this.aImgDOM = [];
    this.controllerUnits = [];
    this.imgFigures = [];
    this.Constants = {
      centerPos: {
        left: 0,
        right: 0
      },
      hPosRange: {
        //水平方向的取值范围
        leftSecX: [0, 0],
        rightSecX: [0, 0],
        y: [0, 0]
      },
      vPosRange: {
        //垂直方向的取值范围
        x: [0, 0],
        topY: [0, 0]
      }
    };
  }
  //组件加载后，为每张图片计算其范围
  componentDidMount() {
    var stageW = this.stageDOM.scrollWidth;
    var stageH = this.stageDOM.scrollHeight;
    var halfStageW = Math.ceil(stageW / 2);
    var halfStageH = Math.ceil(stageH / 2);

    var imgDOM = this.aImgDOM[0];
    var imgW = imgDOM.getWidth();
    var imgH = imgDOM.getHeight();
    var halfImgW = Math.ceil(imgW / 2);
    var halfImgH = Math.ceil(imgH / 2);
    //计算中心图片的位置点
    this.Constants.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    };
    //计算左侧右侧区域图片排布位置的取值范围
    this.Constants.hPosRange.leftSecX[0] = -halfImgW;
    this.Constants.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constants.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constants.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constants.hPosRange.y[0] = -halfImgH;
    this.Constants.hPosRange.y[1] = stageH - halfImgW;
    //计算上侧区域图片排布位置的取值范围
    this.Constants.vPosRange.topY[0] = -halfImgH;
    this.Constants.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constants.vPosRange.x[0] = halfStageW - imgW;
    this.Constants.vPosRange.x[1] = halfStageW;

    this.rearrange(0);
  }

  //反转图片
  inverse(index) {
    return () => {
      var imgsArrangeArr = this.state.imgsArrangeArr;
      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
      this.setState({
        imgsArrangeArr: imgsArrangeArr
      });
    };
  }
  center(index) {
    return () => {
      this.rearrange(index);
    };
  }
  //重新布局所有图片，centerIndex指定居中排布哪个图片
  rearrange(centerIndex) {
    let imgsArrangeArr = this.state.imgsArrangeArr,
      Constants = this.Constants,
      centerPos = Constants.centerPos,
      hPosRange = Constants.hPosRange,
      vPosRange = Constants.vPosRange,
      hPosRangeLeftSecX = hPosRange.leftSecX,
      hPosRangeRightSecX = hPosRange.rightSecX,
      hPosRangeY = hPosRange.y,
      vPosRangeTopY = vPosRange.topY,
      vPosRangeX = vPosRange.x,
      //取centerIndex的那个
      imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1),
      //取0个或者一个
      topImgNum = Math.floor(Math.random() * 2),
      //感觉没啥意义
      topImgSpliceIndex = Math.ceil(
        Math.random() * (imgsArrangeArr.length - topImgNum)
      ),
      //取出要放在上面的图片
      imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

    imgsArrangeCenterArr[0] = {
      pos: centerPos,
      rotate: 0,
      isCenter: true
    };
    //布局位于上侧的信息
    imgsArrangeTopArr.forEach(function(value, index) {
      imgsArrangeTopArr[index] = {
        pos: {
          top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
          left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      };
    });
    //布局左右两侧的图片
    for (var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
      var hPosRangeLORX = null;
      //前半部分左边，后半部分右边
      if (i < k) {
        hPosRangeLORX = hPosRangeLeftSecX;
      } else {
        hPosRangeLORX = hPosRangeRightSecX;
      }

      imgsArrangeArr[i] = {
        pos: {
          top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
          left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      };
    }

    let newImgsArrangeArr = [];
    Array.prototype.splice.apply(
      newImgsArrangeArr,
      [0, 0].concat(imgsArrangeArr)
    );
    Array.prototype.splice.apply(
      newImgsArrangeArr,
      [topImgSpliceIndex, 0].concat(imgsArrangeTopArr)
    );
    Array.prototype.splice.apply(
      newImgsArrangeArr,
      [centerIndex, 0].concat(imgsArrangeCenterArr)
    );
    this.setState({
      imgsArrangeArr: newImgsArrangeArr
    });
  }

  getImageData() {
    return imageJson.map((val, index) => {
      if (!this.state.imgsArrangeArr[index]) {
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        };
      }
      return (
        <ImgFigure
          {...val}
          key={index}
          url={require("./img/" + val.url)}
          ref={e => {
            this.aImgDOM.push(e);
          }}
          inverse={this.inverse(index)}
          center={this.center(index)}
          arrange={this.state.imgsArrangeArr[index]}
        />
      );
    });
  }

  render() {
    return (
      <section
        className="stage"
        ref={e => {
          this.stageDOM = e;
        }}
      >
        <section className="img-sec">{this.getImageData()}</section>
        <nav className="controller-nav">{this.controllerUnits}</nav>
      </section>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
