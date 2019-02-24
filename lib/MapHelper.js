/*import L from 'leaflet'
import '../../static/js/iclient9-leaflet.js'
import '../../static/js/leaflet.draw'

// import ServiceConfig from '../../config/ServiceConfig'
//bug
import Vue from 'vue'*/
class MapHelper {
  /*加载地图*/
  constructor (burl,durl) {
      this.url=burl;
      this.url1=durl;
      this.key='';//key 0 1面积 2marker
      this.editTarget=null//地物编辑-marker
      this.map = L.map('map', {
      crs: L.CRS.EPSG4326,
      center: [38, 119],
      maxZoom: 18,
      zoom: 3
    });
      /*目标要素编辑*/
      this.featureTarget={
      target:{},//要素
      properties:{},//属性
      dataSourceName:'',//数据源名称
      dataSetName:'',//数据集名称
      editType:'',//编辑类型
      };
    let that=this;
    let polygonStyle= {
      showArea: true,
      shapeOptions: {
        stroke: true,
        color: '#6e83f0',
        weight: 4,
        opacity: 0.5,
        fill: true,
        fillColor: null, //same as color by default
        fillOpacity: 0.2,
        clickable: true
      }
    };
    this.featureService = L.supermap.featureService(this.durl);
    this.polyline = new L.Draw.Polyline(this.map,null);//测距
    this.polygon=new L.Draw.Polygon(this.map,polygonStyle)//面积测量
    this.marker=new L.Draw.Marker(this.map,null);
    L.supermap.tiledMapLayer(url).addTo(this.map);

    this.featureGroup = L.featureGroup().addTo(this.map);//要素容器
    this.measureLayer= new L.FeatureGroup();
    this.resultLayer= new L.FeatureGroup();
    that.map.addLayer(this.measureLayer);
    that.map.addLayer(this.resultLayer)
    /*初始化事件*/
    that.map.on(L.Draw.Event.CREATED, function (e) {
        var type = e.layerType,
        layer = e.layer;
         let points=layer.editing.latlngs;
      switch (that.key) {
          case 0:
          that.getAreaResult(L.polygon(points,{color:'red'}));
          break;
        case 2:
          that.getFeaturesByBounds(L.polygon(points[0],{color:'red'}));
          break;
        /*edit feature*/
        case 30:
          that.editTarget=new L.circleMarker(layer._latlng)
          /*if (confirm("yes?")){
            that.commit();
          }*/
          break;
        case 31:
         
         break;
        case 32:
          
        break;
        /*commit*/
      }
      that.featureGroup.addLayer(layer);
      that.polyline.disable();
      that.polygon.disable();
      that.marker.disable();
      that.key=''
    });

   }
  /*检测方法*/
  getException(fn){
    try {
        fn();
    }catch (e) {
      alert(e.message)
    }
  }
  /*初始化控件*/

  initControl(){
    // 添加图层切换控件
    // var baseMaps = { "China": China, "ChinaDark": ChinaDark };
    // L.control.layers(baseMaps).addTo(this.map);
    /*缩放控件*/
    L.control.zoom().addTo(this.map)
    /*比例尺控件*/
    L.control.scale().addTo(this.map)
    /*卷帘*/
    L.control.sideBySide().addTo(this.map)
  }


  /*距离量算*/
  distance(){
    this.polyline.enable();
  }
  /*获取量算结果*/
  getDistanceResult(geometry){
    console.log(geometry)
    //设置量算服务参数
        var measureParam = new SuperMap.MeasureParameters();
    //设置要量算的矢量对象({Line}或{Polygon})，geometry可以通过直接初始化的方法获取

        measureParam.geometry= geometry;

        measureParam.unit = SuperMap.Unit.METER;
    //初始化服务类，设置服务请求关键参数
        var measureService = L.supermap.measureService(this.url);
    //提交服务请求，传递服务查询参数，获取返回结果并按照用户需求进行处理

       /********************************/
        try {
          measureService.measureDistance(measureParam,function (serviceResult){

            // 获取服务器返回的结果
            var result=serviceResult.result;
            if (result)
              alert(result.distance+'m')
            return false;
            });
        }catch (e) {
          alert(e.message)
        }
        /*********************************/
  }
   /*清除要素*/
   clear(){
    this.featureGroup.clearLayers()
     this.resultLayer.clearLayers()
   }
  /*面积量算*/
  area(){
    this.key=0;
    this.polygon.enable();
  }
  getAreaResult(geometry){
    //设置量算服务参数
    var measureParam = new SuperMap.MeasureParameters();
//设置要量算的矢量对象({Line}或{Polygon})，geometry可以通过直接初始化的方法获取
    measureParam.geometry= geometry;

//初始化服务类，设置服务请求关键参数

    var measureService = L.supermap.measureService(this.url);
//提交服务请求，传递服务查询参数，获取返回结果并按照用户需求进行处理
    measureService.measureArea(measureParam,function (serviceResult){
      // 获取服务器返回的结果
      var result=serviceResult.result;
      alert(result.area+'平方米')
    });
  }
  /*添加marker*/
  enableAddMarker(){
    this.key=2;
    this.marker.enable();

  }
  addMarker(geometry){
     this.key=2;
    let marker = L.circleMarker(geometry, {color: "red"});
    this.featureGroup.addLayer(marker);
    this.map.flyTo(geometry, 5);
  }

  /*查询
  * id查询
  * sql查询
  * 范围查询
  * */
  getFeaturesById(url,param){
    var idsParam = new SuperMap.GetFeaturesByIDsParameters({
      IDs:param.ids,
      datasetNames: param.ds
    });
// 创建指定ID查询实例
    let resultLayer=null;
    let that=this;
    L.supermap.featureService(url).getFeaturesByIDs(idsParam, function (serviceResult) {
      // 获取服务器返回的结果
      // var featuers = serviceResult.result.features
      console.log(serviceResult.result)

      /*加载要素
      *
      * bug：请求两次 无结果
      *
      *
      * */
      if (serviceResult.result){
        var resultLayer = L.geoJSON(serviceResult.result.features, {
          onEachFeature: function (feature, layer) {
            layer.bindPopup("ID: " + feature.properties.SMID +
              "<br>" + "：" + feature.properties.COUNTRY);
          }
        }).addTo(that.map);
      }

    });
  }
  /*范围查询*/
  queryByBounds(url){
    this.key=2;
    this.dataUrl=url
    this.polygon.enable()
  }
  getFeaturesByBounds(geometry){
// 设置任意几何范围查询参数
    var geometryParam = new SuperMap.GetFeaturesByGeometryParameters({
      datasetNames: ["World:Countries"],
      geometry: geometry,
      spatialQueryMode: "INTERSECT" // 相交空间查询模式
    });
    let that=this;
// 创建任意几何范围查询实例
    L.supermap .featureService(this.dataUrl) .getFeaturesByGeometry(geometryParam,function (serviceResult) {
      // 获取服务器返回的结果

      that.resultLayer= L.geoJSON(serviceResult.result.features, {
        onEachFeature: function (feature, layer) {
          layer.bindPopup( feature.properties.COUNTRY);
        }
      }).addTo(that.map);
    });
  }
  /*要素编辑功能
   点 线 面
   根据key的不同（30点 31线 32面）启用不同的绘制工具
  */
  //1
  editMarkerFeature(){
      this.key=30
      this.marker.enable();
      this.featureTarget={
        target:this.editTarget,//要素
       properties: {POP: 1, CAPITAL: 'test'},//属性
       dataSourceName:"World",//数据源名称
       dataSetName:"Capitals",//数据集名称
       editType:'add',//编辑类型
      }

  }
  editPolylineFeature(){
      this.key=31
      this.polyline.enable();
      this.featureTarget={

      }
  }
  editPolygonFeature(){
      this.key=32
      this.polyline.enable();
      this.featureTarget={

      }    
  }
  //2
  editFeature(key){
      this.key=key;
      switch (key) {
          case 30:
      this.marker.enable();    
          break;
          case 31:
      this.polyline.enable();
          break;
          case 32:
       this.polygon.enable();
          break;
          default:
          break;
      }
      
  }
  commit(){
    console.log(this.editTarget)
   let t=this.featureTarget.target;
   console.log(t)
    let f =t.toGeoJSON();
    f.properties =t.properties;
    var addFeatureParams = new SuperMap.EditFeaturesParameters({
      dataSourceName: this.featureTarget.dataSourceName,
      dataSetName: this.featureTarget.dataSetName,
      features: f,
      editType: this.featureTarget.editType,
      returnContent: true
    });


    let that=this
    this.featureService.editFeatures(addFeatureParams, function (serviceResult) {
      console.log(serviceResult)
      /*if (serviceResult.result.succeed) {
        // featureGroup.clearLayers();
        that.newMarker = null;
        alert("success")
      }*/
    });
  }
}
// export default MapHelper;
