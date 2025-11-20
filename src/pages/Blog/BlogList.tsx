import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    slug: 'comment-reussir-import-export-afrique',
    title: 'Comment réussir son activité d\'import-export en Afrique de l\'Ouest',
    excerpt: 'Découvrez les clés du succès pour développer votre commerce B2B en Afrique de l\'Ouest. Stratégies, conseils pratiques et pièges à éviter.',
    category: 'Guide',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=400&fit=crop',
    date: '2024-11-15',
    readTime: '8 min',
    author: 'BokaTrade'
  },
  {
    id: 2,
    slug: 'systeme-escrow-securite-transactions',
    title: 'Système Escrow : La sécurité avant tout dans vos transactions B2B',
    excerpt: 'Comprendre le fonctionnement du système Escrow et comment il protège acheteurs et vendeurs lors des transactions professionnelles.',
    category: 'Sécurité',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop',
    date: '2024-11-10',
    readTime: '6 min',
    author: 'BokaTrade'
  },
  {
    id: 3,
    slug: 'optimiser-boutique-marketplace-b2b',
    title: 'Comment optimiser votre boutique sur une marketplace B2B',
    excerpt: 'Les meilleures pratiques pour augmenter votre visibilité, attirer plus de clients professionnels et maximiser vos ventes sur BokaTrade.',
    category: 'Conseils',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    date: '2024-11-05',
    readTime: '10 min',
    author: 'BokaTrade'
  },
  {
    id: 4,
    slug: 'tendances-ecommerce-b2b-afrique-2024',
    title: 'Les tendances du e-commerce B2B en Afrique pour 2024',
    excerpt: 'Analyse des nouvelles opportunités et évolutions du marché B2B africain. Digitalisation, paiements mobiles et commerce transfrontalier.',
    category: 'Actualités',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    date: '2024-11-01',
    readTime: '7 min',
    author: 'BokaTrade'
  }
];

const BlogList = () => {
  return (
    <>
      <SEOHead
        title="Blog E-commerce B2B"
        description="Conseils, guides et actualités pour développer votre activité B2B en Afrique. Import-export, marketplace, sécurité des transactions et tendances du marché."
        keywords="blog b2b, commerce afrique, import export, conseils vendeurs, marketplace b2b"
        canonical="/blog"
      />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
            <div className="container">
              <div className="max-w-3xl">
                <Badge className="mb-4">Blog</Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Conseils & Actualités B2B
                </h1>
                <p className="text-xl text-muted-foreground">
                  Développez votre activité avec nos guides pratiques, conseils d'experts 
                  et analyses du marché B2B africain.
                </p>
              </div>
            </div>
          </section>

          {/* Blog Posts Grid */}
          <section className="container py-12">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{post.category}</Badge>
                      </div>
                      <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readTime}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogList;
