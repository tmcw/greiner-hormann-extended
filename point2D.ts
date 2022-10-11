////////////////////////////////////////////////////////////////////////
//
// point2D.h
//
// contains everything that the polyclip algorithm needs for
// handling 2D points
//
////////////////////////////////////////////////////////////////////////

// #include <iostream>
// #include <cassert>
//
// using namespace std;

////////////////////////////////////////////////////////////////////////
//
// a simple 2D point class with essential functionality
//
////////////////////////////////////////////////////////////////////////

export class point2D {
  x: number;
  y: number;

  constructor(x?: point2D | number, y?: number) {
    if (x instanceof point2D) {
      this.x = x.x;
      this.y = x.y;
    } else if (typeof x === "number" && typeof y === "number") {
      this.x = x;
      this.y = y;
    } else {
      this.x = 0;
      this.y = 0;
    }
  }

  // assigns the values of a 2D point to another
  // inline point2D operator=(const point2D& b) { x=b.x; y=b.y; return *this; }

  // // sum of two 2D points
  // inline point2D operator+(const point2D& b) const { return point2D(x+b.x, y+b.y); }
  // // difference of two 2D points
  sub(b: point2D) {
    return new point2D(this.x - b.x, this.y - b.y);
  }
  // // adds 2D point b to the operand
  // inline void operator+=(const point2D& b) { x+=b.x; y+=b.y; }
  // // subtracts 2D point b from the operand
  // inline void operator-=(const point2D& b) { x-=b.x; y-=b.y; }

  // // multiply a 2D point by a scalar
  // inline point2D operator*(double r) const { return point2D(r*x,r*y); }
  // // multiply the operand by a scalar
  // inline void operator*=(double r) { x*=r; y*=r; }
  // // divide a 2D point by a scalar
  // inline point2D operator/(double r) const { assert(r!=0.0); return point2D(x/r,y/r); }
  // // divide the operand by a scalar
  // inline void operator/=(double r) { assert(r!=0.0); x/=r; y/=r; }

  // // calculate the dot-product
  // inline double operator*(const point2D& b) const { return (x*b.x+y*b.y); }
  dot(b: point2D) {
    return this.x * b.x + this.y * b.y;
  }
  // // calculate the cross-product
  // inline double operator%(const point2D& b) const { return (x*b.y-y*b.x); }
}

// // multiplication operator that allows the scalar value to preceed the 2D point
// inline point2D operator*(double r, const point2D& v) { return v*r; }
//
// // write a 2D point to a stream
// inline ostream& operator<<(ostream& s, const point2D& v) { return (s << v.x << " " << v.y); }
// // read a 2D point from a stream
// inline istream& operator>>(istream& s, point2D& v) { return (s >> v.x >> v.y); }
//

/*
/* compute twice the signed area of the triange [P,Q,R]
*/
export function A(P: point2D, Q: point2D, R: point2D): number {
  return (Q.x - P.x) * (R.y - P.y) - (Q.y - P.y) * (R.x - P.x);
}
