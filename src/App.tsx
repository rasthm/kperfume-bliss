import {useEffect} from 'react';
import {Buy} from './components/Buy';
import {Footer, Header} from './components/Chrome';
import {Gallery} from './components/Gallery';
import {Hero} from './components/Hero';
import {Notes} from './components/Notes';
import {Specs} from './components/Specs';
import {Wear} from './components/Wear';
import {useReducedMotion} from './hooks/useReducedMotion';
import {startScroll} from './lib/scroll';

export default function App() {
  const reduced = useReducedMotion();
  useEffect(() => startScroll(reduced), [reduced]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Notes />
        <Gallery />
        <Specs />
        <Wear />
        <Buy />
      </main>
      <Footer />
    </>
  );
}
