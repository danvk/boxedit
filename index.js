function render(el) {
  var component = <Root />;
  return React.render(component, el);
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
  getInitialState: function() {
    return {
      boxData: '',
      // 1x1 transparent gif
      imageDataUri: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      lettersVisible: true,
      selectedBox: null
    }
  },
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
  handleLettersVisibleChanged: function(visible) {
    this.setState({lettersVisible: visible});
  },
  handleChangeSelection: function(selectedBoxIndex) {
    this.setState({selectedBoxIndex});
  },
  handleChangeLetter: function(lineIndex, newLetter) {
    this.setState({
      boxData: changeLetter(this.state.boxData, lineIndex, newLetter),
      selectedBoxIndex: lineIndex + 1
    });
  },
  handleSplit: function(numWays) {
    this.setState({
      boxData: splitLine(this.state.boxData,
                         this.state.selectedBoxIndex,
                         numWays)
    });
  },
  render: function() {
    return (
      <div>
        <FileUpload {...this.state}
                    onSplit={this.handleSplit}
                    onChangeImage={this.handleImage}
                    onChangeBox={this.handleBox}
                    onChangeLettersVisible={this.handleLettersVisibleChanged} />
        <TextView onChangeBox={this.handleBox}
                  onChangeSelection={this.handleChangeSelection}
                  {...this.state} />
        <ImageView onChangeSelection={this.handleChangeSelection}
                   onChangeLetter={this.handleChangeLetter}
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
  handleSplit: function(e) {
    this.props.onSplit(Number(e.target.value));
  },
  render: function() {
    var splitter;
    if (this.props.selectedBoxIndex !== null) {
      splitter = (
        <select value="none" onChange={this.handleSplit}>
          <option value="none">Split</option>
          <option value="2">2 ways</option>
          <option value="3">3 ways</option>
          <option value="4">4 ways</option>
          <option value="5">5 ways</option>
        </select>
      );
    }
    return (
      <div className='upload'>
        Drag a .box file here: <DropZone onDrop={this.handleNewBox} />
        And an image file here: <DropZone onDrop={this.handleNewImage} />
        <input ref="check" type="checkbox" checked={this.props.lettersVisible} onChange={this.handleLettersVisibleChanged} id="letters-visible" /><label htmlFor="letters-visible">
          Show letters</label>
        {splitter}
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
  currentlySelectedLineIndex: function() {
    var selStart = this.refs.textbox.getDOMNode().selectionStart;
    return countLines(this.props.boxData, selStart);
  },
  componentDidUpdate: function() {
    var lineIndex = this.currentlySelectedLineIndex();
    if (lineIndex != this.props.selectedBoxIndex) {
      var tb = this.refs.textbox.getDOMNode(),
          text = this.props.boxData,
          idx = this.props.selectedBoxIndex;

      tb.selectionStart = startOfLinePosition(text, idx);
      tb.selectionEnd = startOfLinePosition(text, idx + 1) - 1;
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
    return text.split('\n').map(parseBoxLine);
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
  handleKeyPress: function(e) {
    if (document.activeElement != document.body) return;
    var c = String.fromCharCode(e.charCode);
    // TODO: use a blacklist instead of a whitelist?
    if (/^[-0-9a-zA-Z()\[\]{}!@#$%^&*=~?.,;'"\/\\]$/.exec(c)) {
      e.preventDefault();
      this.props.onChangeLetter(this.props.selectedBoxIndex, c);
    }
  },
  componentDidUpdate: function() {
    if (this.props.selectedBoxIndex === null) return;

    var div = this.getDOMNode(),
        box = div.querySelectorAll('.box')[this.props.selectedBoxIndex];
    if (box) {
      box.scrollIntoViewIfNeeded();   // <-- cross-platform?
    }
  },
  componentDidMount: function() {
    document.addEventListener('keypress', this.handleKeyPress);
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
      <div style={style}
           className={classes}
           onClick={this.handleClick}
           onKeyPress={this.handleKey}>
        {letter}
      </div>
    );
  }
});
