import React from 'react';
import styled from 'styled-components';
import { NavigationItem, NavigationLabel } from './';
import { media, colors } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';
import { Icon, IconNames } from 'cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import { darken } from 'polished';
// there's a name clash when importing styled components
// from a file that also imports styled
const xStyled = styled;

const NavigationIconWrapper = xStyled.div`
  display: flex;
  height: 22px;
  width: 22px;
  align-items: center;
  justify-content: center;
  margin-right: 5px;

  ${media.smallPhone`
    height: 20px;
    width: 20px;
  `}
`;

const NavigationIcon = xStyled(Icon)`
  fill: ${colors.label};
  height: 22px;
  width: 22px;

  .cl-icon-primary,
  .cl-icon-accent,
  .cl-icon-secondary {
    fill: ${colors.label};
  }
`;

const StyledLink = xStyled(Link)`
  display: flex;
  align-items: center;
  color: ${colors.label};

  // the darken styles are the same as the ones in the Button component,
  // which is used for the last item of the navbar to show the full menu
  &:hover {
    color: ${darken(0.2, colors.label)};

    ${NavigationIcon} {
      fill: ${darken(0.2, colors.label)};

      .cl-icon-primary,
      .cl-icon-accent,
      .cl-icon-secondary {
        fill: ${darken(0.2, colors.label)};
      }
    }
  }

  &.active {
    color: ${(props) => props.theme.colorMain};

    ${NavigationIcon} {
      fill: ${(props) => props.theme.colorMain};

      .cl-icon-primary,
      .cl-icon-accent,
      .cl-icon-secondary {
        fill: ${(props) => props.theme.colorMain};
      }
    }

  }
`;

interface Props {
  className?: string;
  linkTo: string;
  navigationItemMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  onlyActiveOnIndex?: boolean;
  iconName: IconNames;
  isFullMenuOpened: boolean;
  onClick: () => void;
}

const MobileNavbarItem = ({
  linkTo,
  navigationItemMessage,
  onlyActiveOnIndex,
  iconName,
  isFullMenuOpened,
  onClick,
}: Props) => {
  const handleOnClick = () => {
    onClick();
  };
  return (
    <NavigationItem>
      <StyledLink
        to={linkTo}
        activeClassName={!isFullMenuOpened ? 'active' : ''}
        onlyActiveOnIndex={onlyActiveOnIndex}
        onClick={handleOnClick}
      >
        <NavigationIconWrapper>
          <NavigationIcon name={iconName} />
        </NavigationIconWrapper>
        <NavigationLabel>
          <FormattedMessage {...navigationItemMessage} />
        </NavigationLabel>
      </StyledLink>
    </NavigationItem>
  );
};

export default MobileNavbarItem;