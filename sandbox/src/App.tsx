// * Too much errors in this file? It's intentional. Thanks for your concern. 🙏

import { css } from '../styled-system/css';
import { Circle, HStack, panda } from '../styled-system/jsx';
import { stack } from '../styled-system/patterns';
import { token } from '../styled-system/tokens';
import { defineKeyframes } from '@pandacss/dev';

const keyframes = defineKeyframes({
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
});

// @ts-expect-error noidea
const literal = css`
  color: {colors.red.400};
  margin-right: {sizess.4};
  padding-left: {sizess.4};
  font-weight: token(fontWeightss.bold, 700);
`;

console.log(keyframes, literal);

const LocalFactoryComp = panda('button');

const pbe = '4';
const App = () => {
  const className = css({
    bg: 'red.100',
    borderColor: 'inherit',
    color: '{colors.red.400}',
    debug: true,
    fontSize: 'token(fontSizes.2xl, 4px)',
    margin: '4',
    marginTop: '{spacings.4} token(spacing.600)',
    paddingBlockEnd: ['4', pbe],
    pt: token('sizes.4'),
  });

  const color = 'red';
  const circleSize = '4';
  const ta = 'left';
  const justify = 'center';

  return (
    <div
      className={stack({
        _hover: {
          backgroundColor: 'green.300',
          color: 'green.300/40',
        },
        align: 'stretch !',
        background: 'red',
        backgroundColor: color,
        color: '#111',
        content: "['escape hatch']",
        debug: true,
        justify,
        padding: '40px',
        textAlign: ta,
      })}
    >
      <panda.a href={`mailto:${1}`} />
      <Circle
        _hover={{ bg: 'red.200' }}
        size={circleSize}
      />
      <HStack
        debug
        gap="40px"
      >
        <div className={className}>Element 1</div>
        <panda.div
          bg="red.200"
          borderColor="red.500"
          borderTopColor="#111"
          color={color}
          fontSize="50px"
          fontWeight="bold"
          paddingBlockEnd={['4', color]}
        >
          Element 2
        </panda.div>
      </HStack>
      <LocalFactoryComp debug />
    </div>
  );
};

export default App;
