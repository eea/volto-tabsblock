import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import loadable from '@loadable/component';
import { RenderBlocks } from '@plone/volto/components';
import { withScrollToTarget } from '@eeacms/volto-tabs-block/hocs';
import cx from 'classnames';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@eeacms/volto-tabs-block/less/carousel.less';

const Slider = loadable(() => import('react-slick'));

const ArrowsGroup = (props) => {
  return (
    <div className="slick-arrows">
      <button
        data-role="none"
        className="slick-arrow slick-prev"
        onClick={props.onPrev}
      >
        Previous
      </button>
      <button
        data-role="none"
        className="slick-arrow slick-next"
        onClick={props.onNext}
      >
        Next
      </button>
    </div>
  );
};

const View = (props) => {
  const slider = React.useRef(null);
  const [hashlinkOnMount, setHashlinkOnMount] = React.useState(false);
  const {
    metadata = {},
    data = {},
    tabsList = [],
    tabs = {},
    hashlink = {},
  } = props;
  const theme = data.theme || 'light';
  const uiContainer = data.align === 'full' ? 'ui container' : false;

  const onPrev = () => {
    slider.current.slickPrev();
  };

  const onNext = () => {
    slider.current.slickNext();
  };

  const settings = {
    autoplay: false,
    dots: true,
    speed: 500,
    initialSlide: 0,
    lazyLoad: 'ondemand',
    prevArrow: <React.Fragment />,
    nextArrow: <ArrowsGroup {...props} onPrev={onPrev} onNext={onNext} />,
    swipe: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    touchMove: true,
  };

  React.useEffect(() => {
    const urlHash = props.location.hash.substring(1) || '';
    if (
      hashlink.counter > 0 ||
      (hashlink.counter === 0 && urlHash && !hashlinkOnMount)
    ) {
      const id = hashlink.hash || urlHash || '';
      const index = tabsList.indexOf(id);
      const currentIndex = slider.current?.innerSlider?.state?.currentSlide;
      const parentId = data.id || props.id;
      const parent = document.getElementById(parentId);
      // TODO: Find the best way to add offset relative to header
      //       The header can be static on mobile and relative on > mobile
      // const headerWrapper = document.querySelector('.header-wrapper');
      // const offsetHeight = headerWrapper?.offsetHeight || 0;
      const offsetHeight = 0;
      if (id !== parentId && index > -1 && parent) {
        if (currentIndex !== index) {
          slider.current.slickGoTo(index);
        }
        props.scrollToTarget(parent, offsetHeight);
      } else if (id === parentId && parent) {
        props.scrollToTarget(parent, offsetHeight);
      }
    }
    if (!hashlinkOnMount) {
      setHashlinkOnMount(true);
    }
    /* eslint-disable-next-line */
  }, [hashlink.counter]);

  const panes = tabsList.map((tab, index) => {
    return {
      id: tab,
      renderItem: (
        <RenderBlocks {...props} metadata={metadata} content={tabs[tab]} />
      ),
    };
  });

  return (
    <>
      <Slider {...settings} ref={slider} className={cx(uiContainer, theme)}>
        {panes.length ? panes.map((pane) => pane.renderItem) : ''}
      </Slider>
    </>
  );
};

export default compose(
  connect((state) => {
    return {
      hashlink: state.hashlink,
    };
  }),
  withScrollToTarget,
)(withRouter(View));
