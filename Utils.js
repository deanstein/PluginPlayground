// get the midpoint between two points defined by an array [x,y,z]
function getMidPointBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
{
    var x = (x0 + x1) / 2;
    var y = (y0 + y1) / 2;
    var z = (z0 + z1) / 2;

    var midPoint = new Array(x, y, z);
    // returns [x,y,z]
    return midPoint;
    console.log(midPoint);
}