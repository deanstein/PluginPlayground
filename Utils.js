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

// generic function to test each item in the array, compare for equality, and return a new array containing boolean values
function testForIdentical(array, bArray, message) 
{
    for (var k = 0; k < array.length - 1; k++)
    {
        if (array[k] === array[k+1])
        {
            bArray.push(true);
        }
        if (array[k] != array[k+1])
        {
            bArray.push(false);
        }
    }
    //console.log(message + bArray);
}

// generic function that returns true only if all booleans evaluated are true
function booleanReduce(array)
{
    function isTrue(bool) 
    {
        if (bool === true) 
        {
            return true;
        }
        else 
        {
            return false;
        }
    }
    
    if (array.every(isTrue))
    {
        return true;
    }
    else 
    {
        return false;
    }
}