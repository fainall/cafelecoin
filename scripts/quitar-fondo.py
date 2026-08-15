"""Recorta el fondo de las fotos de producto con segmentación U2-Net (rembg).

Uso:  py -3 scripts/quitar-fondo.py entrada.jpg salida.png [entrada2.jpg salida2.png ...]

Se ejecuta a mano cuando llegan fotos nuevas; el resultado versionado vive en
public/img, así que el build no depende de Python.
"""

import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

# isnet-general-use recorta bordes duros (empaques) mejor que u2net.
MODEL = "isnet-general-use"


def main(argv: list[str]) -> int:
    if len(argv) < 2 or len(argv) % 2 != 0:
        print(__doc__)
        return 1

    session = new_session(MODEL)

    for src, dst in zip(argv[::2], argv[1::2]):
        source = Path(src)
        target = Path(dst)
        target.parent.mkdir(parents=True, exist_ok=True)

        with Image.open(source) as image:
            cut = remove(
                image.convert("RGB"),
                session=session,
                alpha_matting=True,
                alpha_matting_foreground_threshold=250,
                alpha_matting_background_threshold=15,
                alpha_matting_erode_size=6,
                post_process_mask=True,
            )
            cut.save(target)

        print(f"ok  {source.name} -> {target}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
