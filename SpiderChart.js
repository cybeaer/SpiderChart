'use strict'

class SpiderChart{
    _canvas = null;
    _ctx = null;
    _center = {};
    _points = [];
    _entities = [];
    _options = {
        'strikeColor': 'lightgray',//'#000000',
        'strikeWidth': 1,
        'strikeOpac': 0.5,
        'params': [
            'LIFE',
            'INT',
            'STR',
            'AGI',
            'HP'
        ]
    };
    constructor(canvasId, height, width){
        this._canvas = document.getElementById(canvasId);
        this._canvas.height=height;
        this._canvas.width=width;
        this._ctx = this._canvas.getContext('2d');
    }

    addEntity(data){
        if('undefined' == data['id'] || 'undefined' == data['data'])
            return false;
        this._entities[data['id']] = data;
    }

    renderGraph(interval, size=null, recursiv=false){

        this._center.x = this._canvas.width / 2;
        this._center.y = this._canvas.height / 2;
        if(size===null)
            size = this._center.x*0.9
        let numberOfSides = 5,
            Xcenter = this._center.x,
            Ycenter = this._center.y*1.1,
            step  = 2 * Math.PI / numberOfSides,
            shift = (Math.PI / 180.0) * -18;

        this._ctx.beginPath();
        for (let i = 0; i <= numberOfSides;i++) {
            let curStep = i * step + shift;
            let x = Xcenter + size * Math.cos(curStep);
            let y = Ycenter + size * Math.sin(curStep);
            this._ctx.lineTo (x,y);
            if(!recursiv && i != numberOfSides) {
                this._ctx.fillText(this._options.params[i], x - 10, y);
                this._points.push({'x':x, 'y':y});
            }
        }

        this._ctx.strokeStyle = this._options.strikeColor;
        this._ctx.lineWidth = this._options.strikeWidth;
        this._ctx.stroke();

        if(interval-1 > 0)
            this.renderGraph(interval-1,size-20, true)
        else {
            console.log(this._points)
            this._points.forEach(point => {
                console.log(point)
                this._ctx.beginPath();
                this._ctx.moveTo(this._center.x, this._center.y*1.1);
                this._ctx.lineTo(point.x, point.y);

                this._ctx.strokeStyle = this._options.strikeColor;
                this._ctx.lineWidth = this._options.strikeWidth;
                this._ctx.stroke();
            });
        }
    }
}