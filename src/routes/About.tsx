import { Heading, Link, Text, VStack } from "@chakra-ui/react";

import "styles/about.css";

const AboutPage = () => (
  <VStack alignItems='start' className='about-text' mt='1em'>
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
        Motion correction is performed with{" "}
        <Link color='diamond.700' href='https://relion.readthedocs.io/'>
          Relion's
        </Link>{" "}
        own implementation. CTF estimation uses{" "}
        <Link color='diamond.700' href='https://grigoriefflab.umassmed.edu/ctffind4/'>
          CTFFind4
        </Link>
        . Particle picking is performed with{" "}
        <Link color='diamond.700' href='https://cryolo.readthedocs.io/'>
          crYOLO
        </Link>{" "}
        using either the general model that is supplied with crYOLO, or a user-supplied model using
        the "Upload Models" button on PATo.
      </Text>

      <Text>
        The particle diameter will be automatically determined from the crYOLO output. We use the
        position of the 75% percentile of the first 10 000 pick diameters as the extraction
        diameter. Particles are then downscaled during extraction to give a downscaled pixel size
        that is just smaller than 3.75 Å.
      </Text>

      <Text>
        For the first 50 000 particles 2D classification is run every 10 000 particles. The mask
        diameter is taken to be 10% larger than the particle diameter. After this first batch is
        complete all subsequent particles are batched into sets of 50 000 and 2D classification is
        performed on each set. On completion of the first batch the class ranker introduced with
        RELION 4 is used to score each class. This distribution is used to determine a score
        threshold which is used to select particles for 3D classification for all subsequent batched
        2D classifications. Half of picked particles are retained in each batch.
      </Text>

      <Text>
        After 2D class selection the chosen particles are rebatched with a batch size of 50 000. The
        first batch is used to perform de novo initial model generation (unless a reference has been
        uploaded on PATo), followed by 3D classification with 4 classes. This 3D classification is
        performed on batch sizes increasing by increments of 50 000 until a total of 200 000
        particles is reached.
      </Text>

      <Text>
        The angular efficiency of the 3D classes is calculated using{" "}
        <Link color='diamond.700' href='https://www.mrc-lmb.cam.ac.uk/crusso/cryoEF/'>
          cryoEF
        </Link>
        . If the 3D classification produces a map with resolution better than 11 Å and cryoEF score
        better than 0.65, 3D refinement is run on the best class. This will be run at C1 symmetry,
        and then a search will be run over different symmetries to determine the best fit.
      </Text>
    </section>
    <section id='tomogram'>
      <Heading>Tomography</Heading>
      <Text>
        Motion correction is performed with Relion's own implementation and CTF estimation uses
        CTFFind4.
      </Text>

      <Text>
        Alignment and reconstruction are performed with{" "}
        <Link color='diamond.700' href='https://github.com/czimaginginstitute/AreTomo3'>
          AreTomo3
        </Link>{" "}
        using the automated thickness determination and SART reconstruction implementation.
        Alignments are only performed globally to enable faster processing. We display the
        calculated location of each tilt overlaid on the final tomogram so that the quality of the
        alignment can be assessed.
      </Text>

      <Text>
        Tomogram denoising is then performed with{" "}
        <Link color='diamond.700' href='https://github.com/tbepler/topaz'>
          Topaz
        </Link>
        . The denoised tomogram is used for the segmentation of membranes using{" "}
        <Link color='diamond.700' href='https://github.com/teamtomo/membrain-seg'>
          membrain-seg
        </Link>{" "}
        and other features including ribosomes using{" "}
        <Link color='diamond.700' href='https://mgflast.github.io/easymode/'>
          easymode
        </Link>
        . 3D picking is run using crYOLO with the general model.
      </Text>
    </section>
  </VStack>
);

export default AboutPage;
