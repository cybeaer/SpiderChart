'use strict'

/**
 *
 */
class SpiderChart{
    /**
     * @type {HTMLElement}
     * @private
     */
    _canvas = null;
    /**
     * @type {context}
     * @private
     */
    _ctx = null;
    /**
     * @type {{x: number, y: number}}
     * @private
     */
    _center = {};
    /**
     * @type {array}
     * @private
     */
    _points = [];
    /**
     * @type {array}
     * @private
     */
    _entities = [];
    /**
     * @type {number}
     * @private
     */
    _shrink = 0;
    /**
     * @type {int}
     * @private
     */
    _offset = 1.05;
    /**
     * @type {{strikeColor: string, strikeWidth: int, strikeOpacity: int, params: string[]}}
     * @private
     */
    _options = {
        'strikeColor': 'lightgray',
        'strikeWidth': 1,
        'strikeOpacity': 0.5,
        'params': [
            '1',
            '2',
            '3',
            '4',
            '5'
        ]
    };

    /**
     * initialize class
     * @param {string} canvasId - canvas tag id
     * @param {int} height - canvas height
     * @param {int} width - canvas width
     */
    constructor(canvasId, height, width){
        this._canvas = document.getElementById(canvasId);
        this._canvas.height=height;
        this._canvas.width=width;
        this._ctx = this._canvas.getContext('2d');
    }

    /**
     * sets the center offset of the pentagon
     * @param {int} offset - offset of the y coordinates
     */
    setOffset(offset){
        this._offset = offset;
    }

    /**
     * sets color, strike width and opacity of chart
     * @param {string} color - html color code starting with #
     * @param {int} width - line width
     * @param {int} opacity - opacity of grid
     */
    setGrid(color,width,opacity){
        this._options.strikeColor = color;
        this._options.strikeWidth = width;
        this._options.strikeOpacity = opacity
    }

    /**
     * set corner names (5)
     * @param {array} params - array containing 5 corner captions
     */
    setParams(params){
        this._options.params = params;
    }

    /**
     * add entity (only first 5 will be displayed in legend)
     * @param {object} data - object containing with id, data (array with 5 values) and color
     * @returns {boolean} - false if object data invalid
     */
    addEntity(data){
        if(undefined === data['id'] || undefined === data['data'])
            return false;
        this._entities.push(data);
        return true;
    }

    /**
     * renders the pentagon graph
     * @param {int} interval - count of inner "spiderwebs"
     * @param {int} size - size of pentagon - default width/2
     * @param {boolean} recursive - true for last inner spiderweb
     */
    renderGraph(interval=5, size=null, recursive=false){
        this._center.x = this._canvas.width / 2;
        this._center.y = this._canvas.height / 2;
        if(size===null)
            size = this._center.x*0.9
        if(this._shrink === 0)
            this._shrink = size/ interval;
        let numberOfSides = 5,
            step  = 2 * Math.PI / numberOfSides,
            shift = (Math.PI / 180.0) * -18;
        this._ctx.beginPath();
        for (let i = 0; i <= numberOfSides;i++) {
            let curStep = i * step + shift;
            let x = this._center.x + size * Math.cos(curStep);
            let y = this._center.y*this._offset + size * Math.sin(curStep);
            this._ctx.lineTo (x,y);
            if(!recursive && i != numberOfSides) {
                this._ctx.fillText(this._options.params[i], x - 10, y);
                this._points.push({'x':x, 'y':y});
            }
        }
        this._ctx.strokeStyle = this._options.strikeColor;
        this._ctx.lineWidth = this._options.strikeWidth;
        this._ctx.stroke();
        if(interval-1 > 0)
            this.renderGraph(interval-1,size-this._shrink, true)
        else {
            this._shrink = 0;
            this._points.forEach(point => {
                this._ctx.beginPath();
                this._ctx.moveTo(this._center.x, this._center.y*this._offset);
                this._ctx.lineTo(point.x, point.y);

                this._ctx.strokeStyle = this._options.strikeColor;
                this._ctx.lineWidth = this._options.strikeWidth;
                this._ctx.stroke();
            });
            this.renderEntities();
        }
    }

    /**
     * renders the entities above the graph
     */
    renderEntities(){
        this._entities.forEach(entity=>{
            this._ctx.beginPath();
            this._points.forEach((point, idx) => {
                let multi = entity.data[idx]/100;
                let vector = [(point.x-this._center.x)*multi,(point.y-this._center.y*this._offset)*multi];
                this._ctx.lineTo(this._center.x+vector[0], this._center.y*this._offset+vector[1]);
                this._ctx.strokeStyle = this._options.strikeColor;
                this._ctx.lineWidth = this._options.strikeWidth;
                this._ctx.stroke();
            });
            this._ctx.closePath();
            this._ctx.fillStyle = entity.color;//"rgba(0, 0, 0, 0.5)";
            this._ctx.fill();
        });
    }

    /**
     * renders legend of the first 5 entities at the bottom
     */
    renderLegend(){
        let bottom = this._canvas.height -10;
        this._entities.forEach((entity, idx)=>{
            this._ctx.fillStyle = entity.color;
            this._ctx.beginPath();
            this._ctx.arc(idx*50+5, bottom,5, 0,2* Math.PI);
            this._ctx.stroke();
            this._ctx.fill();
            this._ctx.fillStyle = "rgba(0, 0, 0, 1)";
            this._ctx.fillText(entity.id, idx*50+13, bottom+3);
        });
    }
}