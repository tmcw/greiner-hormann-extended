////////////////////////////////////////////////////////////////////////
//
// polygon.h
//
// contains everything that the polyclip algorithm needs for
// handling polygons
//
////////////////////////////////////////////////////////////////////////

import { point2D } from "./point2D";

// #include <fstream>
// #include <iostream>
//
// using namespace std;

////////////////////////////////////////////////////////////////////////
//
// a simple class to handle polygon vertices
//
////////////////////////////////////////////////////////////////////////

enum IntersectionLabel { // for the classification of intersection vertices in the second phase
  NONE,
  CROSSING,
  BOUNCING,
  LEFT_ON,
  RIGHT_ON,
  ON_ON,
  ON_LEFT,
  ON_RIGHT,
  DELAYED_CROSSING,
  DELAYED_BOUNCING,
}

enum EntryExitLabel { // for marking intersection vertices as "entry" or "exit"
  EXIT,
  ENTRY,
  NEITHER,
}

export class vertex {
  p: point2D; // coordinates of the vertex
  prev: vertex; // pointer to previous vertex
  next: vertex; // pointer to next vertex
  neighbour: vertex; // pointer to neighbouring vertex for intersection vertices
  source: boolean; // to mark source vertices of the polygon
  intersection: boolean; // to mark intersection vertices
  alpha: number; // to describe relative edge position of an intersection vertex
  label: IntersectionLabel; // type of intersection vertex
  enex: EntryExitLabel; // entry/exit "flag"

  //
  // default-constructor for generating a vertex with coordinates (0,0)
  //
  constructor(x?: number, y?: number) {
    this.prev = null;
    this.next = null;
    this.neighbour = null;
    this.intersection = false;
    this.source = false;
    this.alpha = -1;
    this.label = IntersectionLabel.NONE;
    this.enex = EntryExitLabel.NEITHER;

    if (typeof x === "number" && typeof y === "number") {
      this.p = new point2D(x, y);
    }

    this.p = new point2D();
  }

  // FIXME: need to implement this constructor
  // constructor for generating a vertex from a 2D point;
  // if alpha is given (and then in [0,1], thus > -1.0),
  // then the vertex will be marked as an intersection vertex
  //
  // vertex(point2D& q, double alpha = -1.0) :
  //   p(q), prev(null), next(null), neighbour(null),
  //   source(false),
  //   alpha(alpha), label(NONE), enex(NEITHER)
  // {
  //   intersection = (alpha > -1.0);
  // };
}
//
// //
// // link vertex P to vertex Q, using the neighbour pointer
// // and mark both vertices as intersection vertices
// //
export function link(P: vertex, Q: vertex) {
  P.neighbour = Q;
  Q.neighbour = P;
  P.intersection = true;
  Q.intersection = true;
}
//
// //
// // insert a vertex between two existing vertices
// // if alpha is given (and then in [0,1], thus > -1.0),
// // then the vertex will be inserted, based on alpha
// //
export function insertVertex(V: vertex, curr: vertex, alpha: number = -1.0) {
  if (alpha > -1.0) {
    do {
      curr = curr.next;
    } while (!curr.source && curr.alpha < alpha);
  } else {
    curr = curr.next;
    curr.prev.next = V;
    V.prev = curr.prev;
    V.next = curr;
    curr.prev = V;
  }
}
//
// ////////////////////////////////////////////////////////////////////////
// //
// // a simple class to handle polygon edges
// //
// ////////////////////////////////////////////////////////////////////////
//
export class edge {
  one: vertex;
  two: vertex;

  //
  // constructor for generating an edge from vertex P to vertex Q
  //
  constructor(P: vertex, Q: vertex) {
    this.one = P;
    this.two = Q;
  }
}
//
// //
// // insert an intersection vertex between the endpoints of edge E
// //
// void insertVertex (vertex* V, edge& E) {
//   insertVertex(V, E.one, V.alpha);
// }
//
// ////////////////////////////////////////////////////////////////////////
// //
// // iterators to loop over vertices and edges, with the option to
// // restrict to source vertices or edges and to intersection vertices
// //
// ////////////////////////////////////////////////////////////////////////
//
export enum IteratorType {
  SOURCE,
  INTERSECTION,
  CROSSING_INTERSECTION,
  ALL,
}

class vertexIterator {
  root: vertex | null;
  V: vertex | null;
  iterType: IteratorType;

  constructor(root: vertex, IterType: IteratorType) {
    this.root = root;
    this.V = null;
    this.iterType = IterType;
    if (root == null) return;

    if (this.nextVertex() == null)
      // no (source/intersection) vertex found
      this.root = this.V = null; // . mark iterator as "end"
  }

  // const iterator& operator++() {
  //   nextVertex();
  //   return *this;
  // }

  // vertex* operator*() {
  //   return V;
  // }

  neq(other: vertexIterator) {
    return this.root != other.root || this.V != other.V;
  }

  //
  // find the next vertex
  // if iterType is ALL, then it is just the next vertex
  // if iterType is SOURCE, then it is the next source vertex
  // if iterType is INTERSECTION, then it is the next intersection vertex
  // if iterType is CROSSING_INTERSECTION, then it is the next intersection vertex with CROSSING label
  //
  nextVertex(): vertex {
    let nextFound = false;

    const V = this.V;

    if (V == null) {
      // find first (source/intersection) vertex
      V = root;
      switch (iterType) {
        case IteratorType.ALL:
          nextFound = true;
          break;
        case IteratorType.SOURCE:
          if (V.source) nextFound = true;
          break;
        case IteratorType.INTERSECTION:
          if (V.intersection) nextFound = true;
          break;
        case IteratorType.CROSSING_INTERSECTION:
          if (V.intersection && V.label == IteratorType.CROSSING)
            nextFound = true;
          break;
      }
    }

    while (!nextFound) {
      // find next (source/intersection) vertex
      switch (iterType) {
        case IteratorType.ALL:
          V = V.next;
          break;
        case IteratorType.SOURCE:
          do {
            V = V.next;
          } while (!V.source && V != root);
          break;
        case IteratorType.INTERSECTION:
          do {
            V = V.next;
          } while (!V.intersection && V != root);
          break;
        case IteratorType.CROSSING_INTERSECTION:
          do {
            V = V.next;
          } while ((!V.intersection || V.label != CROSSING) && V != root);
          break;
      }

      if (V == root) {
        // back at the root vertex?
        root = V = null; // . mark iterator as "end"
        return V;
      }

      switch (this.iterType) {
        case IteratorType.ALL:
          nextFound = true;
          break;
        case IteratorType.SOURCE:
          if (V.source) nextFound = true;
          break;
        case IteratorType.INTERSECTION:
          if (V.intersection) nextFound = true;
          break;
        case IteratorType.CROSSING_INTERSECTION:
          if (V.intersection && V.label == CROSSING) nextFound = true;
          break;
      }
    }
    return V;
  }
}

// public:
//   vertexIterator() : root(null) {};
//
//   iterator begin() { return iterator(root, iterType); }
//   iterator end()   { return iterator(null, iterType); }
//
//   vertex* root;
//   IteratorType iterType;
//
//
// class edgeIterator
// {
// private:
//   class iterator {
//   public:
//     iterator(vertex* root, IteratorType IterType) :
//       root(root), one(null), two(null), iterType(IterType)
//     {
//       if (root == null)
//         return;
//
//       if (nextEdge() == null)           // no source edge found
//         root = one = two = null;        // . mark iterator as "end"
//     }
//
//     const iterator& operator++() { nextEdge(); return *this; }
//
//     edge operator*() {
//       return edge(one,two);
//     }
//
//     bool operator!=(const iterator& other) const {
//       return (root != other.root) || (one != other.one) || (two != other.two);
//     }
//
//   private:
//     vertex* root;
//     vertex* one;
//     vertex* two;
//     IteratorType iterType;
//
//     //
//     // find the next vertex, starting at curr
//     // if iterType is ALL, then it is just the next vertex
//     // if iterType is SOURCE, then it is the next source vertex
//     //
//     vertex* nextVertex(vertex* curr) {
//       if (curr == null)
//         return(null);
//
//       switch(iterType) {
//       case ALL:
//         curr = curr.next;
//         break;
//
//       case SOURCE:
//         do {
//           curr = curr.next;
//         } while (!curr.source);
//         break;
//       }
//
//       return(curr);
//     }
//
//     //
//     // find the next edge
//     //
//     vertex* nextEdge() {
//       if (root == null)                 // empty polygon?
//         return (null);
//
//       if (one == null) {                // find one (source) vertex
//         one = root;                     // note: root is always a (source) vertex
//         two = nextVertex(one);
//         if (two == one)                 // just one (source) vertex
//           return(null);                 // . no (source) edges
//         return(one);
//       }
//
//       if (two == root) {                // back at the root vertex?
//         root = one = two = null;        // . mark iterator as "end"
//         return(null);
//       }
//
//       one = two;
//       two = nextVertex(one);
//
//       return (one);
//     }
//   };
//
// public:
//   edgeIterator() : root(root) {};
//
//   iterator begin() { return iterator(root, iterType); }
//   iterator end()   { return iterator(null, iterType); }
//
//   vertex* root;
//   IteratorType iterType;
// };
//
//
// ////////////////////////////////////////////////////////////////////////
// //
// // a simple polygon class with essential functionality
// //
// ////////////////////////////////////////////////////////////////////////
//
export class polygon {
  root: vertex | null;
  //
  // default-constructor for generating an empty polygon
  //
  constructor() {
    this.root = null;
  }

  //
  // create a new vertex and append it to the polygon
  //
  newVertex(v: point2D, source: boolean = false) {
    let V = new vertex(v);
    V.source = source;

    if (this.root == null) {
      // add vertex as the very first vertex of the polygon
      V.next = V;
      V.prev = V;
      this.root = V;
    } else {
      // add vertex at the end
      V.prev = this.root.prev;
      V.next = this.root;
      this.root.prev.next = V;
      this.root.prev = V;
    }
  }
  //
  //
  // removes the vertex V from the polygon
  //
  removeVertex(V: vertex) {
    if (this.root == V) {
      this.root = V.next;
      if (this.root.next == this.root) this.root = null;
    }
    V.prev.next = V.next;
    V.next.prev = V.prev;
    // delete V;
  }

  //
  // check, if the point R lies inside the polygon or not
  // cf. Algorithm 6 in Hormann & Agathos [2001]
  //
  pointInPoly(R: point2D): boolean {
    let w = 0;
    for (let E of edges(ALL)) {
      let P0 = E.one.p;
      let P1 = E.two.p;

      if (P0.y < R.y != P1.y < R.y)
        if (P0.x >= R.x) {
          if (P1.x > R.x) w = w + 2 * (P1.y > P0.y) - 1;
          else if (A(P0, P1, R) > 0 == P1.y > P0.y)
            w = w + 2 * (P1.y > P0.y) - 1;
        } else if (P1.x > R.x)
          if (A(P0, P1, R) > 0 == P1.y > P0.y) w = w + 2 * (P1.y > P0.y) - 1;
    }

    return w % 2 != 0;
  }
  //
  //   //
  //   // check, if all vertices have the ON_ON label
  //   //
  //   bool allOnOn() {
  //     for (vertex* V : vertices(ALL))
  //       if (V.label != ON_ON)
  //         return(false);
  //     return(true);
  //   }
  //
  //   //
  //   // check, if the polygon does not contain any crossing intersection vertex
  //   // or crossing intersection chain or (if we want to compute the union instead
  //   // of the intersection) a bouncing vertex or a bouncing intersection chain
  //   //
  //   bool noCrossingVertex(bool union_case = false) {
  //     for (vertex* V : vertices(ALL))
  //       if (V.intersection) {
  //         if ( (V.label == CROSSING) || (V.label == DELAYED_CROSSING) )
  //           return(false);
  //
  //         if (union_case && ( (V.label == BOUNCING) || (V.label == DELAYED_BOUNCING) ) )
  //           return(false);
  //       }
  //     return(true);
  //   }
  //
  /*
   * return a non-intersection point
   */
  getNonIntersectionPoint(): point2D {
    for (let V of this.vertices(ALL)) {
      if (!V.intersection) {
        return V.p;
      }
    }

    // no non-intersection vertex found . find suitable edge midpoint
    // make sure that edge from V to V.next is not collinear with other polygon
    for (let V of this.vertices(ALL)) {
      if (
        V.next.neighbour != V.neighbour.prev &&
        V.next.neighbour != V.neighbour.next
      ) {
        // return edge midpoint
        return 0.5 * (V.p + V.next.p);
      }
    }
  }
  //
  //   //
  //   // return and insert a non-intersection vertex
  //   //
  //   vertex* getNonIntersectionVertex() {
  //     for (vertex* V : vertices(ALL))
  //       if (!V.intersection)
  //         return(V);
  //
  //     // no non-intersection vertex found . generate and return temporary vertex
  //     for (vertex* V : vertices(ALL))
  //       // make sure that edge from V to V.next is not collinear with other polygon
  //       if ( (V.next.neighbour != V.neighbour.prev) && (V.next.neighbour != V.neighbour.next) ) {
  //         // add edge midpoint as temporary vertex
  //         point2D p = 0.5*(V.p + V.next.p);
  //         vertex* T = new vertex(p);
  //         insertVertex(T, V);
  //         return(T);
  //       }
  //     return(null);
  //   }
  //
  /*
   * return iterator to loop over (source/intersection) vertices,
   * starting at first (by default, it starts at root)
   */
  vertices(
    iterType: IteratorType,
    first: vertex | null = null
  ): vertexIterator {
    vertexIter.iterType = iterType;

    if (first == null) vertexIter.root = this.root;
    else vertexIter.root = first;

    return vertexIter;
  }
  //
  //
  // return iterator to loop over (source) edges
  //
  edges(iterType: IteratorType): edgeIterator {
    edgeIter.iterType = iterType;
    edgeIter.root = root;
    return edgeIter;
  }
  //
  //   vertex* root;               // root vertex of the polygon
  //
  // protected:
  //   vertexIterator vertexIter;  // vertex iterator
  //   edgeIterator edgeIter;      // edge iterator
}

//
// //
// // read polygon from a stream
// //
// inline istream& operator>>(istream& s, polygon& P) {
//   point2D v;
//   char c;
//   bool readOn = true;
//
//   do {
//     s >> v >> c;
//   	if (s.fail())
//   		readOn = false;
//   	else {
//       P.newVertex(v, true);
//
//       if (c == ';')
//         readOn = false;
//   	}
//   } while (readOn && !s.eof());
//
//   return (s);
// }
//
// //
// // write polygon to a stream
// //
// inline ostream& operator<<(ostream& s, polygon& P) {
//   if (P.root == null)
//     return (s);
//   for (vertex* V : P.vertices(ALL)) {
//     s << V.p;
//     if (V != P.root.prev)
//       s << "," << endl;
//   }
//   return (s << ";\n");
// }
//
// //
// // toggle status from ENTRY to EXIT or vice versa
// //
// void toggle(EntryExitLabel& status) {
//   if (status == ENTRY) {
//     status = EXIT;
//     return;
//   }
//   if (status == EXIT) {
//     status = ENTRY;
//     return;
//   }
// }
