function render(el) {
  var component = <Root />;
  return React.render(component, el);
  // return component;
}

var Root = React.createClass({
  /*
  stateTypes: {
    imageDataUri: React.PropTypes.string,
    boxData: React.PropTypes.string,
    imageHeight: React.PropTypes.number,
    lettersVisible: React.PropTypes.bool,
    selectedBoxIndex: React.PropTypes.number
  },
  */
  handleImage: function(imageDataUri) {
    var im = new Image();
    im.src = imageDataUri;
    this.setState({
      imageDataUri,
      imageHeight: im.height
    });
  },
  handleBox: function(boxData) {
    this.setState({boxData});
  },
  getInitialState: function() {
    return {
      boxData: '',
      // 1x1 transparent gif
      imageDataUri: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      lettersVisible: true,
      selectedBox: null
    }
  },
  handleLettersVisibleChanged: function(visible) {
    this.setState({lettersVisible: visible});
  },
  handleChangeSelection: function(selectedBoxIndex) {
    this.setState({selectedBoxIndex});
  },
  render: function() {
    return (
      <div>
        <FileUpload {...this.state}
                    onChangeImage={this.handleImage}
                    onChangeBox={this.handleBox}
                    onChangeLettersVisible={this.handleLettersVisibleChanged} />
        <TextView onChangeBox={this.handleBox}
                  onChangeSelection={this.handleChangeSelection}
                  {...this.state} />
        <ImageView onChangeSelection={this.handleChangeSelection}
                   {...this.state} />
      </div>
    );
  }
});


var FileUpload = React.createClass({
  handleNewBox: function(file) {
    var reader = new FileReader();
    reader.onload = e => {
      this.props.onChangeBox(e.target.result);
    };

    reader.readAsText(file);
  },
  handleNewImage: function(file) {
    var reader = new FileReader();
    reader.onload = e => {
      this.props.onChangeImage(e.target.result);
    };

    reader.readAsDataURL(file);
  },
  handleLettersVisibleChanged: function() {
    this.props.onChangeLettersVisible(this.refs.check.getDOMNode().checked);
  },
  render: function() {
    return (
      <div className='upload'>
        Drag a .box file here: <DropZone onDrop={this.handleNewBox} />
        And an image file here: <DropZone onDrop={this.handleNewImage} />
        <input ref="check" type="checkbox" checked={this.props.lettersVisible} onChange={this.handleLettersVisibleChanged} id="letters-visible" /><label htmlFor="letters-visible">
          Show letters</label>
      </div>
    );
  }
});


// Should use https://github.com/Khan/react-components/blob/master/js/drag-target.jsx
var DropZone = React.createClass({
  propTypes: {
    onDrop: React.PropTypes.func.isRequired
  },
  onFileSelect: function(e) {
    var files = e.target.files;
    if (files.length === 0) return;
    if (files.length > 1) {
      window.alert('You may only upload one file at a time.');
      return;
    }
    this.props.onDrop(files[0]);
  },
  render: function() {
    return <input type='file' onChange={this.onFileSelect} />;
  }
});

var TextView = React.createClass({
  handleChange: function() {
    this.props.onChangeBox(this.refs.textbox.getDOMNode().value);
  },
  checkSelection: function() {
    var lineIndex = this.currentlySelectedLineIndex();
    if (lineIndex != this.props.selectedBoxIndex) {
      this.props.onChangeSelection(lineIndex);
    }
  },
  countLines: function(text, position) {
    var count = 0;
    for (var i = 0; i < position; i++) {
      if (text.charAt(i) == '\n') count++;
    }
    return count;
  },
  startOfLinePosition: function(text, lineNumber) {
    var count = 0;
    for (var i = 0; i < text.length; i++) {
      if (text.charAt(i) == '\n') {
        count++;
        if (count >= lineNumber) return i + 1;
      }
    }
    return i;
  },
  currentlySelectedLineIndex: function() {
    var selStart = this.refs.textbox.getDOMNode().selectionStart;
    return this.countLines(this.props.boxData, selStart);
  },
  componentDidUpdate: function() {
    var lineIndex = this.currentlySelectedLineIndex();
    if (lineIndex != this.props.selectedBoxIndex) {
      var tb = this.refs.textbox.getDOMNode();
      tb.selectionStart = this.startOfLinePosition(this.props.boxData, this.props.selectedBoxIndex);
      tb.selectionEnd = this.startOfLinePosition(this.props.boxData, this.props.selectedBoxIndex + 1) - 1;
    }
  },
  render: function() {
    return (
      <div className='text-view'>
        <textarea ref='textbox'
                  value={this.props.boxData}
                  onClick={this.checkSelection}
                  onKeyUp={this.checkSelection}
                  onChange={this.handleChange} />
      </div>
    );
  }
});

var ImageView = React.createClass({
  makeBoxes: function(text) {
    if (!text || text.length == 0) return [];
    return this.props.boxData.split('\n').map(line => {
      var parts = line.split(' ');
      return {
        letter: parts[0],
        left: parseInt(parts[1], 0),
        top: parseInt(parts[2], 0),
        right: parseInt(parts[3], 0),
        bottom: parseInt(parts[4], 0)
      }
    });
  },
  transform: function(boxesImageCoords) {
    var height = this.props.imageHeight ||
                 Math.max.apply(null, boxesImageCoords.map(c => c.top));
    return boxesImageCoords.map(box => ({
      letter: box.letter,
      left: box.left,
      right: box.right,
      top: height - box.bottom,
      bottom: height - box.top
    }));
  },
  handleBoxClick: function(index) {
    this.props.onChangeSelection(index);
  },
  componentDidUpdate: function() {
    if (this.props.selectedBoxIndex === null) return;

    var div = this.getDOMNode(),
        box = div.querySelectorAll('.box')[this.props.selectedBoxIndex];
    if (box) {
      box.scrollIntoViewIfNeeded();   // <-- cross-platform?
    }
  },
  render: function() {
    var boxesImageCoords = this.makeBoxes(this.props.boxData),
        boxesScreenCoords = this.transform(boxesImageCoords),
        boxes = boxesScreenCoords.map(
            (data, i) => <Box key={i}
                              index={i}
                              isSelected={i === this.props.selectedBoxIndex}
                              onClick={this.handleBoxClick}
                              {...this.props} {...data} />);
    return (
      <div className='image-viewer'>
        <img src={this.props.imageDataUri} />
        {boxes}
      </div>
    );
  }
});

var Box = React.createClass({
  handleClick: function() {
    this.props.onClick(this.props.index);
  },
  render: function() {
    var style = {
      position: 'absolute',
      left: this.props.left + 'px',
      top: this.props.top + 'px',
      width: (this.props.right - this.props.left) + 'px',
      height: (this.props.bottom - this.props.top) + 'px'
    };
    var classes = React.addons.classSet({
      'box': true,
      'selected': this.props.isSelected
    });
    var letter = this.props.lettersVisible ? this.props.letter : '';
    return (
      <div style={style} className={classes} onClick={this.handleClick}>
        {letter}
      </div>
    );
  }
});
