import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { CategoryService, UpdateService } from './services';

const mockCategoryService = {
  createInitialDefaults: () => {},
};

const mockUpdateService = {
  updateAvailable: () => null,
  checkForUpdate: () => Promise.resolve(),
  dismiss: () => {},
  openDownload: () => Promise.resolve(),
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            currentUser: { email: 'test@test.com' },
            onAuthStateChanged: (cb: (user: unknown) => void) => {
              cb({ email: 'test@test.com' });
              return () => {};
            },
          },
        },
        { provide: Firestore, useValue: {} },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: UpdateService, useValue: mockUpdateService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render logo', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-header__logo')).toBeTruthy();
  });
});
