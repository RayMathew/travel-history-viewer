import { ExtLinkButtonProps } from '@/lib/types/frontend';
import { Button } from 'primereact/button';

export default function ExtLinkButton({
    ariaLabel,
    link,
    imgSrc,
    tooltipPosition,
    tooltipFallback
}: ExtLinkButtonProps) {

    return (
        <Button
            rounded
            text
            raised
            aria-label={ariaLabel}
            onClick={() => window.open(link, "_blank")}
            disabled={!link}
            tooltip={link ? '' : tooltipFallback}
            tooltipOptions={{ showOnDisabled: true, position: tooltipPosition ? tooltipPosition : undefined, showDelay: 400 }}
            className='aspect-square drop-shadow-2xl'
        >
            <img className='w-6' src={imgSrc} />
        </Button>
    );
}