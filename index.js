function render(el) {
  var component = <Root />;
  React.render(component, el);
  return component;
}

var Root = React.createClass({
  handleImage: function(imageDataUri) {
    this.setState({imageDataUri});
  },
  handleBox: function(boxData) {
    this.setState({boxData});
    console.log(boxData);
  },
  render: function() {
    return (
      <div>
        <FileUpload {...this.state}
                    onChangeImage={this.handleImage}
                    onChangeBox={this.handleBox} />
        <TextView onChangeBox={this.handleBox}
                  {...this.state} />
        <ImageView {...this.state} />
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
  },
  render: function() {
    return (
      <div className='upload'>
        Drag a .box file here: <DropZone onDrop={this.handleNewBox} />
        And an image file here: <DropZone onDrop={this.handleNewImage} />
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
  render: function() {
    return (
      <div className='text-view'>
        <textarea value={this.props.boxData} />
      </div>
    );
  }
});

var ImageView = React.createClass({
  render: function() {
    return null;
  }
});
