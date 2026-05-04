// Shim for eve-raphael module
// snap.svg depends on 'eve' being available as a global variable
import eve from 'eve-raphael'

// Make eve available globally for snap.svg
if (typeof window !== 'undefined') {
  window.eve = eve
}

export default eve
