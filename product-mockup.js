(() => {
  'use strict';

  let serial = 0;
  const escapeAttribute = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  // All measurements use the original photo's coordinates. These paths cover only
  // the fabric, so changing a colour leaves the model and studio untouched.
  window.productMockupConfig = {
    base: 'assets/great-era-model-regular.png',
    viewBox: '0 0 1122 1402',
    width: 1122,
    height: 1402,
    frontClip: 'M191 324 C184 327 175 332 163 338 C128 354 84 379 50 404 C38 427 27 456 20 482 C11 515 3 539 0 552 L0 618 C23 626 62 634 97 634 C101 624 101 607 104 594 C100 623 101 653 102 681 C102 712 97 743 94 766 C90 788 87 811 87 832 C86 852 81 872 81 893 C78 911 77 925 78 940 C77 953 78 963 79 972 C108 989 157 1001 202 1008 C235 1014 266 1015 296 1012 C350 1009 403 995 437 976 C435 966 438 959 438 947 C441 929 443 913 441 897 C439 878 439 862 439 846 C438 826 441 809 439 790 C436 766 434 740 432 713 C431 687 430 665 431 640 L434 619 C436 627 436 633 439 637 C478 634 520 625 556 616 C551 595 546 573 538 550 C532 525 525 497 518 473 C511 446 503 422 489 404 C456 381 413 355 369 335 C360 331 353 327 347 324 C348 335 342 347 334 354 C319 367 293 374 270 375 C245 375 221 369 207 359 C196 351 189 337 191 324 Z',
    backClip: 'M781 309 C766 309 757 314 748 323 C715 337 682 355 655 371 C640 379 626 389 616 399 C603 421 595 446 588 471 C581 495 575 523 570 549 C566 572 563 596 562 617 C579 627 605 634 632 638 C644 640 654 640 664 639 C662 665 656 691 655 715 C652 741 653 769 651 795 C650 818 650 838 647 860 C645 882 643 903 642 926 C639 947 638 970 632 991 L627 1012 C651 1028 688 1037 727 1042 C775 1049 820 1050 864 1050 C913 1050 958 1048 1000 1043 C1027 1040 1050 1031 1062 1020 C1061 1002 1056 984 1053 965 C1049 944 1046 922 1043 900 C1040 880 1037 861 1036 840 C1034 818 1035 795 1032 774 C1030 752 1027 730 1026 709 C1024 685 1024 662 1027 642 C1046 649 1082 642 1119 632 L1122 631 L1122 556 C1117 532 1111 507 1105 483 C1098 454 1087 424 1074 403 C1054 386 1024 369 997 355 C975 343 955 333 938 323 C930 315 923 311 913 310 C869 313 824 312 781 309 Z',
    logo: {
      src: 'assets/real-piece-front-logo.png',
      x: 190,
      y: 458,
      width: 170,
      height: 40.74,
      // Trim the transparent padding without stretching the original logo.
      viewBox: '274 1427 2658 637',
      sourceWidth: 3200,
      sourceHeight: 3200
    },
    artwork: { x: 693, y: 470, width: 300, height: 340 }
  };

  window.renderProductMockup = ({
    id = 'product', name = 'Real Piece', artwork = '', color = 'Nero',
    hex = '#1e1d22', mode = 'card'
  } = {}) => {
    const config = window.productMockupConfig;
    const prefix = `rp-mockup-${++serial}`;
    const selectedHex = /^#[\da-f]{6}$/i.test(hex) ? hex : '#1e1d22';
    const channels = [1, 3, 5].map(index => (parseInt(selectedHex.slice(index, index + 2), 16) / 255).toFixed(6));
    const logo = config.logo;
    const print = config.artwork;
    const label = `${name} — ${color}, stesso modello visto davanti e dietro`;
    const attr = escapeAttribute;

    return `<svg class="product-mockup product-mockup-${attr(mode)}" xmlns="http://www.w3.org/2000/svg" viewBox="${attr(config.viewBox)}" width="${attr(config.width)}" height="${attr(config.height)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${attr(label)}" data-mockup-product="${attr(id)}" data-mockup-color="${attr(color)}" focusable="false">
      <defs>
        <clipPath id="${prefix}-fabric" clipPathUnits="userSpaceOnUse"><path d="${attr(config.frontClip)}"/><path d="${attr(config.backClip)}"/></clipPath>
        <filter id="${prefix}-colour" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feComponentTransfer>
            <feFuncR type="linear" slope="${channels[0]}" intercept="0"/>
            <feFuncG type="linear" slope="${channels[1]}" intercept="0"/>
            <feFuncB type="linear" slope="${channels[2]}" intercept="0"/>
            <feFuncA type="identity"/>
          </feComponentTransfer>
        </filter>
      </defs>
      <image href="${attr(config.base)}" x="0" y="0" width="${attr(config.width)}" height="${attr(config.height)}" preserveAspectRatio="xMidYMid meet"/>
      <image href="${attr(config.base)}" x="0" y="0" width="${attr(config.width)}" height="${attr(config.height)}" preserveAspectRatio="xMidYMid meet" clip-path="url(#${prefix}-fabric)" filter="url(#${prefix}-colour)"/>
      <svg x="${attr(logo.x)}" y="${attr(logo.y)}" width="${attr(logo.width)}" height="${attr(logo.height)}" viewBox="${attr(logo.viewBox)}" preserveAspectRatio="xMidYMid meet" overflow="hidden" aria-hidden="true">
        <image href="${attr(logo.src)}" x="0" y="0" width="${attr(logo.sourceWidth)}" height="${attr(logo.sourceHeight)}"/>
      </svg>
      ${artwork ? `<image href="${attr(artwork)}" x="${attr(print.x)}" y="${attr(print.y)}" width="${attr(print.width)}" height="${attr(print.height)}" preserveAspectRatio="xMidYMin meet" aria-hidden="true"/>` : ''}
    </svg>`;
  };
})();
