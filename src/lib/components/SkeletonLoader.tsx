
import styled, { keyframes } from "styled-components";



const animation = keyframes`

    0% {
      background-color: hsl(200, 20%, 80%);
    }
    100% {
      background-color: hsl(200, 20%, 95%);
    }


`;

const Skeleton = styled.div`
  animation: ${animation} 1s linear infinite alternate;
  width: 100%;
  height: 30px;
`;





export function SkeletonLoader() {
  return (
    <Skeleton  />
  );
}

