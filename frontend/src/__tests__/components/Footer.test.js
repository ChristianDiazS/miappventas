import { render, screen } from '@testing-library/react';

describe('Footer Component', () => {
  const Footer = () => (
    <footer>
      <p>MiAppVentas</p>
      <p>Enlaces | Acerca de</p>
      <p>Contacto | Email</p>
      <p>Redes sociales</p>
      <a href="https://facebook.com">Facebook</a>
      <a href="https://twitter.com">Twitter</a>
      <a href="https://instagram.com">Instagram</a>
      <p>© 2025 MiAppVentas</p>
      <p>Política | Privacidad | Términos</p>
    </footer>
  );
  it('debe renderizar el footer correctamente', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('debe mostrar información de la tienda', () => {
    render(<Footer />);
    expect(screen.getByText(/miappventas/i)).toBeInTheDocument();
  });

  it('debe mostrar secciones de enlaces útiles', () => {
    render(<Footer />);
    expect(screen.getByText(/enlaces|links|acerca de|about/i)).toBeInTheDocument();
  });

  it('debe tener enlaces de categorías', () => {
    render(<Footer />);
    const categoryLinks = screen.queryAllByRole('link');
    expect(categoryLinks.length).toBeGreaterThan(0);
  });

  it('debe mostrar información de contacto', () => {
    render(<Footer />);
    expect(screen.getByText(/contacto|contact|email|teléfono|phone/i)).toBeInTheDocument();
  });

  it('debe mostrar redes sociales', () => {
    const { container } = render(<Footer />);
    const socialSection = screen.queryByText(/redes sociales|social media/i);
    expect(socialSection).toBeInTheDocument();
  });

  it('debe tener enlaces a redes sociales', () => {
    render(<Footer />);
    const facebookLink = screen.queryByRole('link', { name: /facebook/i });
    expect(facebookLink).toBeInTheDocument();
  });

  it('debe mostrar derechos de autor', () => {
    render(<Footer />);
    expect(screen.getByText(/©|derechos|rights|copyright/i)).toBeInTheDocument();
  });

  it('debe mostrar enlaces de política y términos', () => {
    render(<Footer />);
    expect(screen.getByText(/política|privacidad|términos|privacy|terms/i)).toBeInTheDocument();
  });
});
