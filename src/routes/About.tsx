import { Heading, Link, Text, VStack } from "@chakra-ui/react";

import "styles/about.css";

const AboutPage = () => (
  <VStack alignItems='start' className='about-text'>
    <section id='about'>
      <Heading>About</Heading>
      <Text>
        Processing is triggered automatically using parameters from instrument metadata. The aim of
        this processing is to be as automated as possible and to follow the data collection as
        closely as possible.
      </Text>
    </section>
    <section id='spa'>
      <Heading>SPA</Heading>
      <Text>
        Motion correction is performed with MotionCor2. CTF estimation uses CTFFind4. Particle
        picking is performed with crYOLO unless explicitly disabled using a general model that can
        be found at{" "}
        <Link color='diamond.700' href='https://cryolo.readthedocs.io/en/stable/installation.html'>
          https://cryolo.readthedocs.io/en/stable/installation.html
        </Link>
        .
      </Text>

      <Text>
        In most cases particle diameter will be automatically determined from the crYOLO output. We
        use the position of the 75% percentile of the first 10 000 pick diameters as the extraction
        diameter. We downscale the particles during extraction. The downscaling is chosen such that
        the downscaled pixel size is just smaller than 4.25 Å.
      </Text>

      <Text>
        For the first 50 000 particles 2D classification is run every 10 000 particles. The mask
        diameter is taken to be 10% larger than the particle diameter. After this first batch is
        complete all subsequent particles are batched into sets of 50 000 and 2D classification is
        performed on that set. On completion of the first batch the class ranker introduced with
        RELION 4 is used to score each class. This distribution is used to determine a score
        threshold which is used to select particles for 3D classification for all subsequent batched
        2D classifications. At least half of picked particles are retained in each batch.
      </Text>

      <Text>
        After 2D class selection the chosen particles are rebatched with a batch size of 50 000. The
        first batch is used to perform de novo initial model generation, followed by 3D
        classification with 4 classes. This 3D classification is performed on batch sizes increasing
        by increments of 50 000 until a total of 200 000 particles is reached.
      </Text>
    </section>
    <section id='tomogram'>
      <Heading>Tomography</Heading>
      <Text>Motion correction is performed with MotionCor2. CTF estimation uses CTFFind4.</Text>

      <Text>
        Alignment and reconstruction are performed with AreTomo using the SART reconstruction
        implementation. Alignments are only performed globally to save time. Tomogram denoising is
        then performed with Topaz.
      </Text>
    </section>
  </VStack>
);

export default AboutPage;
