import unittest
from brand import brand_html


class BrandTests(unittest.TestCase):
    def test_changes_presentation_but_preserves_runtime_and_licence_comments(self):
        source = '''<!doctype html><html><head><title>Canvas | Restaurant</title><link rel="icon" href="old.ico"></head><body><!-- Copyright original author -->
        <div id="logo"><a href="demo-restaurant.html"><img src="images/logo.png" srcset="images/logo@2x.png 2x" alt="Canvas Logo"><img class="logo-dark" src="images/logo-dark.png"></a></div>
        <canvas id="canvas"></canvas><script>const canvas=document.querySelector('canvas');const label='Canvas';</script>
        <style>.canvas{color:red}</style><code>Canvas API</code><p>Canvas &amp; Crafto</p>
        <a href="https://themeforest.net/item/canvas/123">Purchase Canvas</a></body></html>'''
        output, count = brand_html(source, 'demo-restaurant.html', 'canvas', 'https://d123.cloudfront.net/forgeia-v2/demo-restaurant.html')
        self.assertEqual(count, 2)
        self.assertIn('<title>FORGEIA | Restaurant</title>', output)
        self.assertIn('logo-dark.svg', output)
        self.assertIn('logo-light.svg', output)
        self.assertNotIn('old.ico', output)
        self.assertIn('forgeia-brand/favicon.svg', output)
        self.assertIn("const canvas=document.querySelector('canvas');const label='Canvas';", output)
        self.assertIn('<canvas id="canvas">', output)
        self.assertIn('.canvas{color:red}', output)
        self.assertIn('<code>Canvas API</code>', output)
        self.assertIn('<!-- Copyright original author -->', output)
        self.assertIn('https://www.forgeia.site/espace/ressources?tab=sites', output)

    def test_repeat_processing_keeps_logo_variants_and_one_favicon(self):
        source = '<html><head></head><body><div id="logo"><img src="images/logo.png"></div></body></html>'
        first, _ = brand_html(source, 'demo-business.html', 'canvas')
        second, _ = brand_html(first, 'demo-business.html', 'canvas')
        self.assertEqual(first, second)
        self.assertEqual(second.count('rel="icon"'), 1)

    def test_nested_pages_and_only_brand_logos(self):
        source = '<html><head></head><body><a class="navbar-brand"><img src="../../images/logo-white.png"></a><img src="images/demo-business-clients-logo-1.png"><img src="images/demo-accounting-logo-01.png"><p>info@canvas.com</p></body></html>'
        output, count = brand_html(source, 'include/examples/test.html', 'crafto')
        self.assertEqual(count, 1)
        self.assertIn('../../forgeia-brand/logo-light.svg', output)
        self.assertIn('images/demo-business-clients-logo-1.png', output)
        self.assertIn('images/demo-accounting-logo-01.png', output)
        self.assertIn('contact@forgeia.site', output)

    def test_marketing_thumbnails_are_regenerated_examples(self):
        source = '<html><head></head><body><a href="demo-business.html"><img data-src="images/old-thumb.jpg" src="placeholder.jpg"></a></body></html>'
        output, _ = brand_html(source, 'index.html', 'crafto', known_pages=['demo-business.html'])
        self.assertIn('thumbnails/demo-business.jpg', output)
        self.assertNotIn('images/old-thumb.jpg', output)

    def test_page_links_are_branded_without_renaming_canvas_apis(self):
        source = '<html><head><title>Slider</title></head><body><canvas id="canvas"></canvas><a href="slider-canvas.html?mode=1#slide">Canvas Slider</a><script>const canvas=document.querySelector("canvas");const url="slider-canvas.html";</script></body></html>'
        output, _ = brand_html(source, 'index.html', 'canvas', page_map={'slider-canvas.html': 'slider-forgeia.html'})
        self.assertIn('slider-forgeia.html?mode=1#slide', output)
        self.assertIn('const url="slider-forgeia.html"', output)
        self.assertIn('document.querySelector("canvas")', output)
        self.assertIn('Slider | FORGEIA</title>', output)


if __name__ == '__main__':
    unittest.main()
