import React from 'react';
import {Flex, Image, Heading, Link} from '@chakra-ui/react';
import logo512 from '../../media/logo512.png';

/**
 * @returns the logo for the top left corner of the site
 */
const Logo: () => JSX.Element = () => {
  return (
    <Link href="/" _hover={{textDecor: 'none'}}>
      <Flex flexDir="row" alignItems="center">
        <Image width="2.5em" src={logo512} alt="Logo"></Image>
        <Heading marginLeft={5} fontSize={'xl'} color="white">
          South Gate Air Quality
        </Heading>
      </Flex>
    </Link>
  );
};

export default Logo;
